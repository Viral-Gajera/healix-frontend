import {
  checkHealth,
  getUserProfile,
  listChats,
} from "@/lib/api"
import { toChat } from "../converters"
import { ChatState } from "../types"

type SetFunction = (state: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void
type GetFunction = () => ChatState

export const createInitializationActions = (set: SetFunction, get: GetFunction) => ({
  initialize: async () => {
    const profile = get().profile
    const userId = profile?.userId
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
      // Parallel load: profile and sessions together
      const [backendProfile, sessions] = await Promise.all([
        getUserProfile(userId, profile.name || undefined, profile.email || undefined),
        listChats(userId),
      ])

      const chats = sessions.map(toChat)

      set((state: ChatState) => ({
        profile: backendProfile || state.profile,
        chats,
        activeChatId:
          state.activeChatId &&
          chats.some((chat) => chat.chatId === state.activeChatId)
            ? state.activeChatId
            : (chats[0]?.chatId ?? null),
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
})
