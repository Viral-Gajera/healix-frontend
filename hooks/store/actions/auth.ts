import { UserProfile } from "@/lib/types"
import { ChatState } from "../types"

export const createAuthActions = (set: (state: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void) => ({
  login: (userId: string, name?: string, email?: string) => {
    set({
      profile: {
        id: userId,
        name: name || "Healix User",
        email: email || "",
        password: "",
        gender: "",
        globalMemory: "",
        settings: {},
      } as UserProfile,
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
