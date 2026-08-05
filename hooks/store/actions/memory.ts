import {
  getChatMemory,
  getChatMessages,
  updateChatMemory as persistChatMemory,
} from "@/lib/api"
import { toMessage } from "../converters"
import { ChatState } from "../types"
import { Chat, Message } from "@/lib/types"

type SetFunction = (state: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void
type GetFunction = () => ChatState

export const createMemoryActions = (set: SetFunction, get: GetFunction) => ({
  loadChatMessages: async (chatId: string) => {
    const profile = get().profile
    if (!profile) {
      set({ error: "Please sign in to load chats" })
      return
    }

    try {
      const messages = await getChatMessages(chatId, profile.id)
      set((state: ChatState) => ({
        chats: state.chats.map((chat: Chat) =>
          chat.id === chatId
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

  loadChatMemory: async (chatId: string) => {
    const profile = get().profile
    if (!profile) {
      set({ error: "Please sign in to load memories" })
      return
    }

    try {
      const memory = await getChatMemory(chatId, profile.id)
      set((state: ChatState) => ({
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

  saveChatMemory: async (chatId: string, memory: string) => {
    const profile = get().profile
    if (!profile) {
      set({ error: "Please sign in to save memories" })
      return
    }

    try {
      await persistChatMemory(chatId, profile.id, memory)
      set((state: ChatState) => ({
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
            : "Failed to save chat memory",
      })
    }
  },
})
