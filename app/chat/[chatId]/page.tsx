"use client"

import { use, useEffect } from "react"
import { ChatWindow } from "@/components/chat/chat-window"
import { ChatInput } from "@/components/chat/chat-input"
import { useChatStore } from "@/hooks/store"
import { useRouter } from "next/navigation"

export default function ChatIdPage({
  params,
}: {
  params: Promise<{ chatId: string }>
}) {
  // In Next.js 15, params is a Promise, so we must `use()` it.
  const resolvedParams = use(params)
  const chatId = resolvedParams.chatId
  const { chats, setActiveChatId, loadChatMessages } = useChatStore()
  const router = useRouter()
  const chatExists = chats.some((c) => c.chatId === chatId)

  useEffect(() => {
    setActiveChatId(chatId)
    void loadChatMessages(chatId)
    return () => setActiveChatId(null)
  }, [chatId])

  useEffect(() => {
    if (!chatExists && chats.length > 0) {
      // If chat doesn't exist, redirect to chat home
      router.push("/chat")
    }
  }, [chatExists, chats.length, router])

  if (!chatExists) return null

  return (
    <>
      {/* Header for mobile or just extra context */}
      <div className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="truncate text-sm font-semibold">
          {chats.find((c) => c.chatId === chatId)?.title || "New Chat"}
        </h1>
      </div>

      <ChatWindow chatId={chatId} />
      <ChatInput chatId={chatId} />
    </>
  )
}
