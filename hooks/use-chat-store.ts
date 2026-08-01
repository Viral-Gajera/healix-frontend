import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Chat, Message, User, Attachment, UserProfile } from "@/lib/types"
import {
  BackendMessage,
  BackendSession,
  BackendUserProfile,
  checkHealth,
  createSession,
  deleteSession as deleteBackendSession,
  getSessionMemory,
  getSessionMessages,
  getUserGlobalMemory,
  getUserProfile,
  listSessions,
  streamSessionMessage,
  updateSessionMemory as persistSessionMemory,
  updateUserGlobalMemory as persistUserGlobalMemory,
  updateUserProfile as persistUserProfile,
} from "@/lib/api"

interface ChatState {
  user: User | null
  profile: UserProfile | null
  chats: Chat[]
  globalMemory: string
  chatMemories: Record<string, string>
  activeChatId: string | null
  isTyping: boolean
  isLoadingChats: boolean
  error: string | null
  sidebarExpanded: boolean

  login: (name?: string, email?: string, userId?: string) => void
  logout: () => void
  initialize: () => Promise<void>
  loadProfile: () => Promise<void>
  saveProfile: (
    updates: Partial<UserProfile> & { password?: string }
  ) => Promise<void>
  loadGlobalMemory: () => Promise<void>
  saveGlobalMemory: (memory: string) => Promise<void>
  loadChatMessages: (chatId: string) => Promise<void>
  loadChatMemory: (chatId: string) => Promise<void>
  saveChatMemory: (chatId: string, memory: string) => Promise<void>
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

const toUserProfile = (
  user: User | null,
  profile: BackendUserProfile | null
): UserProfile | null => {
  if (!user) {
    return null
  }

  return {
    id: user.id,
    name: profile?.name?.trim() || user.name,
    email: profile?.email?.trim() || user.email,
    avatarUrl: user.avatarUrl,
    password: profile?.password || "",
    gender: profile?.gender || "",
    globalMemory: profile?.global_memory || "",
    settings: profile?.settings || {},
  }
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      chats: [],
      globalMemory: "",
      chatMemories: {},
      activeChatId: null,
      isTyping: false,
      isLoadingChats: false,
      error: null,
      sidebarExpanded: true,

      login: (name?: string, email?: string, userId?: string) => {
        const normalizedEmail = email?.trim().toLowerCase() || "user@healix.app"
        const derivedUserId = `user_${normalizedEmail.replace(/[^a-z0-9]/g, "_")}`
        const finalUserId = userId || derivedUserId
        set({
          user: {
            id: finalUserId,
            name: name?.trim() || "Healix User",
            email: normalizedEmail,
            avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(normalizedEmail)}`,
          },
          profile: {
            id: finalUserId,
            name: name?.trim() || "Healix User",
            email: normalizedEmail,
            avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(normalizedEmail)}`,
            password: "",
            gender: "",
            globalMemory: "",
            settings: {},
          },
        })
      },

      logout: () =>
        set({
          user: null,
          profile: null,
          globalMemory: "",
          chatMemories: {},
          activeChatId: null,
          chats: [],
          error: null,
        }),

      loadProfile: async () => {
        const user = get().user
        if (!user) {
          return
        }

        try {
          const profile = await getUserProfile(user.id, user.name, user.email)
          const nextProfile = toUserProfile(user, profile)
          set({
            profile: nextProfile,
            globalMemory: nextProfile?.globalMemory || "",
          })
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load user profile",
          })
        }
      },

      saveProfile: async (updates) => {
        const user = get().user
        const currentProfile = get().profile
        if (!user) {
          set({ error: "Please sign in to update profile" })
          return
        }

        try {
          const nextSettings = Object.fromEntries(
            Object.entries(
              updates.settings ?? currentProfile?.settings ?? {}
            ).filter(
              (entry): entry is [string, string | number | boolean | null] =>
                entry[1] !== undefined
            )
          )
          const profile = await persistUserProfile(user.id, {
            name: updates.name,
            email: updates.email,
            password: updates.password,
            gender: updates.gender,
            settings: nextSettings,
          })
          const nextProfile = toUserProfile(
            {
              ...user,
              name: updates.name?.trim() || user.name,
              email: updates.email?.trim() || user.email,
            },
            profile
          )
          set({
            user: nextProfile
              ? {
                  id: nextProfile.id,
                  name: nextProfile.name,
                  email: nextProfile.email,
                  avatarUrl: nextProfile.avatarUrl,
                }
              : user,
            profile: nextProfile,
            globalMemory: nextProfile?.globalMemory || get().globalMemory,
            error: null,
          })
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to save user profile",
          })
        }
      },

      loadGlobalMemory: async () => {
        const user = get().user
        if (!user) {
          return
        }

        try {
          const memory = await getUserGlobalMemory(
            user.id,
            user.name,
            user.email
          )
          set((state) => ({
            globalMemory: memory,
            profile: state.profile
              ? { ...state.profile, globalMemory: memory }
              : state.profile,
            error: null,
          }))
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load global memory",
          })
        }
      },

      saveGlobalMemory: async (memory) => {
        const user = get().user
        if (!user) {
          set({ error: "Please sign in to save global memory" })
          return
        }

        try {
          const nextMemory = await persistUserGlobalMemory(user.id, memory)
          set((state) => ({
            globalMemory: nextMemory,
            profile: state.profile
              ? { ...state.profile, globalMemory: nextMemory }
              : state.profile,
            error: null,
          }))
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to save global memory",
          })
        }
      },

      initialize: async () => {
        const userId = get().user?.id
        if (!userId) {
          set({
            chats: [],
            activeChatId: null,
            isLoadingChats: false,
            error: null,
          })
          return
        }

        set({ isLoadingChats: true, error: null })
        try {
          await checkHealth()
          await get().loadProfile()
          await get().loadGlobalMemory()
          const sessions = await listSessions(userId)
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
        const userId = get().user?.id
        if (!userId) {
          set({ error: "Please sign in to load chats" })
          return
        }

        try {
          const messages = await getSessionMessages(chatId, userId)
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

      loadChatMemory: async (chatId) => {
        const userId = get().user?.id
        if (!userId) {
          set({ error: "Please sign in to load chat memory" })
          return
        }

        try {
          const memory = await getSessionMemory(chatId, userId)
          set((state) => ({
            chatMemories: {
              ...state.chatMemories,
              [chatId]: memory,
            },
            error: null,
          }))
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load chat memory",
          })
        }
      },

      saveChatMemory: async (chatId, memory) => {
        const userId = get().user?.id
        if (!userId) {
          set({ error: "Please sign in to save chat memory" })
          return
        }

        try {
          const nextMemory = await persistSessionMemory(chatId, userId, memory)
          set((state) => ({
            chatMemories: {
              ...state.chatMemories,
              [chatId]: nextMemory,
            },
            error: null,
          }))
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to save chat memory",
          })
        }
      },

      setActiveChatId: (id) => set({ activeChatId: id }),

      createNewChat: async () => {
        const userId = get().user?.id
        if (!userId) {
          set({ error: "Please sign in to create chats" })
          return null
        }

        try {
          const session = await createSession("Disease Diagnosis Chat", userId)
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
        const userId = get().user?.id
        if (!userId) {
          set({ error: "Please sign in to delete chats" })
          return
        }

        try {
          await deleteBackendSession(id, userId)
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
        const userId = get().user?.id
        if (!userId) {
          set({ error: "Please sign in to send messages" })
          return
        }

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
              return {
                ...chat,
                updatedAt: new Date(),
                messages: [
                  ...chat.messages,
                  userMessage,
                  pendingAssistantMessage,
                ],
              }
            }
            return chat
          }),
        }))

        try {
          let streamError: string | null = null
          let streamDone = false

          await streamSessionMessage(chatId, userId, content, {
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
            onDone: (assistant, session) => {
              streamDone = true
              set((state) => ({
                chats: state.chats.map((chat) => {
                  if (chat.id !== chatId) {
                    return chat
                  }

                  return {
                    ...chat,
                    title: session?.topic?.trim() || chat.title,
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
          void get().loadGlobalMemory()
          void get().loadChatMemory(chatId)
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
