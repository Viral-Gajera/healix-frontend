import { Chat, Attachment, UserProfile } from "@/lib/types"

export interface ChatState {
  profile: UserProfile | null
  chats: Chat[]
  activeChatId: string | null
  isTyping: boolean
  isLoadingChats: boolean
  error: string | null
  sidebarExpanded: boolean

  login: (userId: string, name?: string, email?: string) => void
  logout: () => void
  initialize: () => Promise<void>
  loadProfile: () => Promise<void>
  saveProfile: (
    updates: Partial<UserProfile> & { password?: string }
  ) => Promise<void>
  loadChatMessages: (chatId: string) => Promise<void>
  setActiveChatId: (id: string | null) => void
  createNewChat: () => Promise<string | null>
  deleteChat: (id: string) => Promise<void>
  sendMessage: (
    chatId: string,
    content: string,
    attachments?: Attachment[]
  ) => Promise<void>
  setSidebarExpanded: (expanded: boolean) => void
}
