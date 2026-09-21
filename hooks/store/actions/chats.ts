import {
  createChat,
  deleteChat as deleteBackendChat,
} from "@/lib/api"
import { toChat } from "../converters"
import { ChatState } from "../types"
import { Chat } from "@/lib/types"

type SetFunction = (state: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void
type GetFunction = () => ChatState

export const createChatActions = (set: SetFunction, get: GetFunction) => ({
  setActiveChatId: (id: string | null) => set({ activeChatId: id }),

  createNewChat: async () => {
    const profile = get().profile
    if (!profile) {
      set({ error: "Please sign in to create chats" })
      return null
    }

    try {
      const chat = await createChat("Disease Diagnosis Chat", profile.userId)
      const newChat = toChat(chat)
      set((state: ChatState) => ({
        chats: [newChat, ...state.chats],
        activeChatId: newChat.chatId,
        error: null,
      }))
      return newChat.chatId
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

  deleteChat: async (id: string) => {
    const profile = get().profile
    if (!profile) {
      set({ error: "Please sign in to delete chats" })
      return
    }

    try {
      await deleteBackendChat(id, profile.userId)
      set((state: ChatState) => ({
        chats: state.chats.filter((c: Chat) => c.chatId !== id),
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
})
