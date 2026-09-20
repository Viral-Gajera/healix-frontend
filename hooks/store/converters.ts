import { Chat, Message, UserProfile } from "@/lib/types"
import {
  Message as ApiMessage,
  Chat as ApiChat,
  UserProfile as ApiUserProfile,
} from "@/lib/api"

export const toDate = (value?: string): Date =>
  value ? new Date(value) : new Date()

export const toChat = (apiChat: ApiChat): Chat => ({
  id: apiChat.chat_id,
  title: apiChat.topic?.trim() || "New Conversation",
  createdAt: toDate(apiChat.created_at),
  updatedAt: toDate(apiChat.updated_at ?? apiChat.created_at),
  messages: [],
})

export const toMessage = (item: ApiMessage): Message => ({
  id: `${item.role}-${item.timestamp}-${Math.random().toString(36).slice(2, 9)}`,
  role: item.role,
  content: item.content,
  createdAt: toDate(item.timestamp),
})

export const toUserProfile = (
  profile: ApiUserProfile | null
): UserProfile | null => {
  if (!profile) {
    return null
  }

  return {
    id: profile.user_id,
    name: profile.name || "",
    email: profile.email || "",
    password: profile.password || "",
    gender: profile.gender || "",
    globalMemory: profile.global_memory || "",
    settings: profile.settings || {},
  }
}
