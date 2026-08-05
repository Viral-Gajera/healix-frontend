import { Chat, Attachment, UserProfile } from "@/lib/types"

export interface ChatState {
  profile: UserProfile | null
  chats: Chat[]
  chatMemories: Record<string, string>
  activeChatId: string | null
  isTyping: boolean
  isLoadingChats: boolean
  error: string | null
  sidebarExpanded: boolean

  login: (name?: string, email?: string, userId?: string) => void
  logout: () => void
  initialize: () => Promise<void>
  loadProfile: () => Promise<void>
  saveProfile: (
    updates: Partial<UserProfile> & { password?: string }
  ) => Promise<void>
  loadChatMessages: (chatId: string) => Promise<void>
  loadChatMemory: (chatId: string) => Promise<void>
  saveChatMemory: (chatId: string, memory: string) => Promise<void>
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
