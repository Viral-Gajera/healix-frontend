import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ChatState } from "./types"
import { getInitialState } from "./initial-state"
import { createAuthActions } from "./actions/auth"
import { createProfileActions } from "./actions/profile"
import { createInitializationActions } from "./actions/initialization"
import { createChatActions } from "./actions/chats"
import { createMessageActions } from "./actions/messages"
import { createUIActions } from "./actions/ui"

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),
      ...createAuthActions(set),
      ...createProfileActions(set, get),
      ...createInitializationActions(set, get),
      ...createChatActions(set, get),
      ...createMessageActions(set, get),
      ...createUIActions(set),
    }),
    {
      name: "healix-storage",
      partialize: (state) => ({
        sidebarExpanded: state.sidebarExpanded,
      }),
    }
  )
)
