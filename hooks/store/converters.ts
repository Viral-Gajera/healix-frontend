import { Chat, Message, UserProfile } from "@/lib/types"
import {
  Message as ApiMessage,
  Chat as ApiChat,
} from "@/lib/api"

export const toDate = (value?: string): Date =>
  value ? new Date(value) : new Date()

export const toChat = (apiChat: ApiChat): Chat => ({
  chatId: apiChat.chatId,
  title: apiChat.topic?.trim() || "New Conversation",
  createdAt: toDate(apiChat.createdAt),
  updatedAt: toDate(apiChat.updatedAt ?? apiChat.createdAt),
  messages: [],
})

export const toMessage = (item: ApiMessage): Message => ({
  id: `${item.role}-${item.timestamp}-${Math.random().toString(36).slice(2, 9)}`,
  role: item.role,
  content: item.content,
  createdAt: toDate(item.timestamp),
})
