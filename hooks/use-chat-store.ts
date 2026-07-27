import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Chat, Message, User, Attachment } from "@/lib/types"
import {
  BackendMessage,
  BackendSession,
  checkHealth,
  createSession,
  deleteSession as deleteBackendSession,
  getSessionMessages,
  listSessions,
  streamSessionMessage,
} from "@/lib/api"

interface ChatState {
  user: User | null
  chats: Chat[]
  activeChatId: string | null
  isTyping: boolean
  isLoadingChats: boolean
  error: string | null
  sidebarExpanded: boolean

  login: (name?: string, email?: string) => void
  logout: () => void
  initialize: () => Promise<void>
  loadChatMessages: (chatId: string) => Promise<void>
  setActiveChatId: (id: string | null) => void
  createNewChat: () => Promise<string | null>
  deleteChat: (id: string) => Promise<void>
  sendMessage: (
    chatId: string,
    content: string,
    attachments?: Attachment[]
  ) => Promise<void>
  setSidebarExpanded: (expanded: boolean) => void
}

const toDate = (value?: string): Date => (value ? new Date(value) : new Date())

const toChat = (session: BackendSession): Chat => ({
  id: session.session_id,
  title: session.topic?.trim() || "New Conversation",
  createdAt: toDate(session.created_at),
  updatedAt: toDate(session.updated_at ?? session.created_at),
  messages: [],
})

const toMessage = (item: BackendMessage): Message => ({
  id: `${item.role}-${item.timestamp}-${Math.random().toString(36).slice(2, 9)}`,
  role: item.role,
  content: item.content,
  createdAt: toDate(item.timestamp),
})

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      user: null,
      chats: [],
      activeChatId: null,
      isTyping: false,
      isLoadingChats: false,
      error: null,
      sidebarExpanded: true,

      login: (name, email) =>
        set({
          user: {
            id: `user-${Date.now()}`,
            name: name?.trim() || "Healix User",
            email: email?.trim() || "user@healix.app",
            avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(
              email?.trim() || "healix-user"
            )}`,
          },
        }),

      logout: () =>
        set({ user: null, activeChatId: null, chats: [], error: null }),

      initialize: async () => {
        set({ isLoadingChats: true, error: null })
        try {
          await checkHealth()
          const sessions = await listSessions()
          const chats = sessions.map(toChat)
          set((state) => ({
            chats,
            activeChatId:
              state.activeChatId &&
              chats.some((chat) => chat.id === state.activeChatId)
                ? state.activeChatId
                : (chats[0]?.id ?? null),
            isLoadingChats: false,
          }))
        } catch (error) {
          set({
            isLoadingChats: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to initialize chat service",
          })
        }
      },

      loadChatMessages: async (chatId) => {
        try {
          const messages = await getSessionMessages(chatId)
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    messages: messages.map(toMessage),
                    updatedAt:
                      messages.length > 0
                        ? toDate(messages[messages.length - 1].timestamp)
                        : chat.updatedAt,
                  }
                : chat
            ),
          }))
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load chat messages",
          })
        }
      },

      setActiveChatId: (id) => set({ activeChatId: id }),

      createNewChat: async () => {
        try {
          const session = await createSession()
          const newChat = toChat(session)
          set((state) => ({
            chats: [newChat, ...state.chats],
            activeChatId: newChat.id,
            error: null,
          }))
          return newChat.id
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to create new chat",
          })
          return null
        }
      },

      deleteChat: async (id) => {
        try {
          await deleteBackendSession(id)
          set((state) => ({
            chats: state.chats.filter((c) => c.id !== id),
            activeChatId: state.activeChatId === id ? null : state.activeChatId,
            error: null,
          }))
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to delete chat",
          })
        }
      },

      sendMessage: async (chatId, content, attachments) => {
        const streamAssistantMessageId = `msg-stream-${Date.now()}`
        const userMessage: Message = {
          id: `msg-${Date.now()}`,
          role: "user",
          content,
          createdAt: new Date(),
          attachments,
        }

        const pendingAssistantMessage: Message = {
          id: streamAssistantMessageId,
          role: "assistant",
          content: "",
          createdAt: new Date(),
        }

        set((state) => ({
          isTyping: true,
          error: null,
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              const title =
                chat.messages.length === 0
                  ? `${content.slice(0, 30)}${content.length > 30 ? "..." : ""}`
                  : chat.title
              return {
                ...chat,
                title,
                updatedAt: new Date(),
                messages: [...chat.messages, userMessage, pendingAssistantMessage],
              }
            }
            return chat
          }),
        }))

        try {
          let streamError: string | null = null
          let streamDone = false

          await streamSessionMessage(chatId, content, {
            onToken: (chunk) => {
              set((state) => ({
                chats: state.chats.map((chat) => {
                  if (chat.id !== chatId) {
                    return chat
                  }

                  return {
                    ...chat,
                    updatedAt: new Date(),
                    messages: chat.messages.map((message) =>
                      message.id === streamAssistantMessageId
                        ? { ...message, content: `${message.content}${chunk}` }
                        : message
                    ),
                  }
                }),
              }))
            },
            onDone: (assistant) => {
              streamDone = true
              set((state) => ({
                chats: state.chats.map((chat) => {
                  if (chat.id !== chatId) {
                    return chat
                  }

                  return {
                    ...chat,
                    updatedAt: new Date(),
                    messages: chat.messages.map((message) => {
                      if (message.id !== streamAssistantMessageId) {
                        return message
                      }

                      return {
                        ...message,
                        content: assistant?.content ?? message.content,
                        createdAt: assistant?.timestamp
                          ? toDate(assistant.timestamp)
                          : message.createdAt,
                      }
                    }),
                  }
                }),
              }))
            },
            onError: (message) => {
              streamError = message
            },
          })

          if (streamError) {
            throw new Error(streamError)
          }

          if (!streamDone) {
            throw new Error("Stream ended unexpectedly before completion")
          }

          set({ isTyping: false })
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to send message to Healix backend"

          set((state) => ({
            isTyping: false,
            error: message,
            chats: state.chats.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    updatedAt: new Date(),
                    messages: chat.messages.map((msg) =>
                      msg.id === streamAssistantMessageId
                        ? {
                            ...msg,
                            content: `I could not process your request right now. ${message}`,
                          }
                        : msg
                    ),
                  }
                : chat
            ),
          }))
        }
      },

      setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
    }),
    {
      name: "healix-storage",
      partialize: (state) => ({
        user: state.user,
        sidebarExpanded: state.sidebarExpanded,
      }),
    }
  )
)
