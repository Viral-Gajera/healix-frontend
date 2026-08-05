type StateValues = {
  profile: null
  chats: []
  chatMemories: Record<string, string>
  activeChatId: null
  isTyping: boolean
  isLoadingChats: boolean
  error: null
  sidebarExpanded: boolean
}

export const getInitialState = (): StateValues => ({
  profile: null,
  chats: [],
  chatMemories: {},
  activeChatId: null,
  isTyping: false,
  isLoadingChats: false,
  error: null,
  sidebarExpanded: true,
})
