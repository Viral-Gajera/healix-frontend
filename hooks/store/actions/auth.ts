import { UserProfile } from "@/lib/types"
import { ChatState } from "../types"

export const createAuthActions = (set: (state: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void) => ({
  login: (profile: UserProfile) => {
    set({
      profile,
    })
  },

  logout: () =>
    set({
      profile: null,
      activeChatId: null,
      chats: [],
      error: null,
    }),
})
