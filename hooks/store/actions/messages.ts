import { Attachment, Message, Chat } from "@/lib/types"
import { streamChatMessage, getChatMessages } from "@/lib/api"
import { toMessage } from "../converters"
import { ChatState } from "../types"

type SetFunction = (state: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void
type GetFunction = () => ChatState

export const createMessageActions = (set: SetFunction, get: GetFunction) => ({
  sendMessage: async (
    chatId: string,
    content: string,
    attachments?: Attachment[]
  ) => {
    const profile = get().profile
    if (!profile) return

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

    set((state: ChatState) => ({
      isTyping: true,
      error: null,
      chats: state.chats.map((chat: Chat) => {
        if (chat.chatId === chatId) {
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

      await streamChatMessage(chatId, profile.userId, content, {
        onToken: (chunk) => {
          set((state: ChatState) => {
            const chatIndex = state.chats.findIndex((c: Chat) => c.chatId === chatId)
            if (chatIndex === -1) return state
            
            const chat = state.chats[chatIndex]
            const messageIndex = chat.messages.findIndex(
              (m: Message) => m.id === streamAssistantMessageId
            )
            if (messageIndex === -1) return state
            
            // Create a minimal patch for this token
            return {
              chats: state.chats.map((c: Chat, i: number) => 
                i === chatIndex
                  ? {
                      ...c,
                      updatedAt: new Date(),
                      messages: c.messages.map((m: Message, j: number) =>
                        j === messageIndex
                          ? { ...m, content: `${m.content}${chunk}` }
                          : m
                      ),
                    }
                  : c
              ),
            }
          })
        },
        onDone: (assistant, session) => {
          streamDone = true
          set((state: ChatState) => {
            const chatIndex = state.chats.findIndex((c: Chat) => c.chatId === chatId)
            if (chatIndex === -1) return state
            
            const chat = state.chats[chatIndex]
            const messageIndex = chat.messages.findIndex(
              (m: Message) => m.id === streamAssistantMessageId
            )
            if (messageIndex === -1) return state
            
            return {
              chats: state.chats.map((c: Chat, i: number) =>
                i === chatIndex
                  ? {
                      ...c,
                      title: session?.topic?.trim() || c.title,
                      updatedAt: new Date(),
                      messages: c.messages.map((m: Message, j: number) =>
                        j === messageIndex
                          ? {
                              ...m,
                              content: assistant?.content ?? m.content,
                              createdAt: assistant?.timestamp
                                ? new Date(assistant.timestamp)
                                : m.createdAt,
                            }
                          : m
                      ),
                    }
                  : c
              ),
            }
          })
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

      set((state: ChatState) => ({
        isTyping: false,
        error: message,
        chats: state.chats.map((chat: Chat) =>
          chat.chatId === chatId
            ? {
                ...chat,
                updatedAt: new Date(),
                messages: chat.messages.map((msg: Message) =>
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

  loadChatMessages: async (chatId: string) => {
    const profile = get().profile
    if (!profile) return

    try {
      const messages = await getChatMessages(chatId, profile.userId)
      set((state: ChatState) => ({
        chats: state.chats.map((chat: Chat) =>
          chat.chatId === chatId
            ? {
                ...chat,
                messages: messages.map(toMessage),
                updatedAt:
                  messages.length > 0
                    ? new Date(messages[messages.length - 1].timestamp)
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
})
