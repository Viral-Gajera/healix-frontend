export type Role = "user" | "assistant"

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
}

export interface Message {
  id: string
  role: Role
  content: string
  createdAt: Date
  attachments?: Attachment[]
}

export interface Chat {
  chatId: string
  title: string
  createdAt: Date
  updatedAt: Date
  messages: Message[]
}

export interface User {
  id: string
  name: string
  email: string
}

export interface UserProfile {
  userId: string
  name?: string | null
  email?: string | null
  password?: string | null
  gender?: string | null
  globalMemory?: string | null
  createdAt?: string
  updatedAt?: string
}
