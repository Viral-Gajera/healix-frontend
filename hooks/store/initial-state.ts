type StateValues = {
  profile: null
  chats: []
  activeChatId: null
  isTyping: boolean
  isLoadingChats: boolean
  error: null
  sidebarExpanded: boolean
}

export const getInitialState = (): StateValues => ({
  profile: null,
  chats: [],
  activeChatId: null,
  isTyping: false,
  isLoadingChats: false,
  error: null,
  sidebarExpanded: true,
})
