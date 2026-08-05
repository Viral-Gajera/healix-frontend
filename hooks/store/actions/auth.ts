import { UserProfile } from "@/lib/types"
import { ChatState } from "../types"

export const createAuthActions = (set: (state: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void) => ({
  login: (name?: string, email?: string, userId?: string) => {
    const normalizedEmail = email?.trim().toLowerCase() || "user@healix.app"
    const derivedUserId = `user_${normalizedEmail.replace(/[^a-z0-9]/g, "_")}`
    const finalUserId = userId || derivedUserId
    set({
      profile: {
        id: finalUserId,
        name: name?.trim() || "Healix User",
        email: normalizedEmail,
        avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(normalizedEmail)}`,
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
      chatMemories: {},
      activeChatId: null,
      chats: [],
      error: null,
    }),
})
