import { ChatState } from "../types"

type SetFunction = (state: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void

export const createUIActions = (set: SetFunction) => ({
  setSidebarExpanded: (expanded: boolean) => set({ sidebarExpanded: expanded }),
})
