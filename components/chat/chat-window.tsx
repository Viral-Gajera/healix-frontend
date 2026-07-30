"use client"

import { useEffect, useRef } from "react"
import { useChatStore } from "@/hooks/use-chat-store"
import { HeartPulse } from "lucide-react"
import { MessageBubble } from "@/components/chat/message-bubble"

interface ChatWindowProps {
  chatId: string
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { chats, isTyping, user } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chat = chats.find((c) => c.id === chatId)
  const lastMessageIndex = chat ? chat.messages.length - 1 : -1

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chat?.messages, isTyping])

  if (!chat) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Chat not found.
      </div>
    )
  }

  return (
    <div className="custom-scrollbar relative flex-1 overflow-y-auto px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {chat.messages.length === 0 ? (
          <div className="flex h-[50vh] animate-in flex-col items-center justify-center space-y-6 text-center opacity-80 duration-700 fade-in slide-in-from-bottom-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-md bg-teal-500/10 shadow-inner">
              <HeartPulse className="h-10 w-10 text-teal-500" />
            </div>
            <h2 className="text-2xl font-bold">How can I help you today?</h2>
            <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
              {[
                "What are the symptoms of dehydration?",
                "How can I improve my sleep schedule?",
                "Suggest a high-protein vegetarian diet.",
                "What's a good stretch for lower back pain?",
              ].map((suggestion, i) => (
                <div
                  key={i}
                  className="cursor-pointer rounded-md border border-border/50 bg-accent/30 p-4 text-left text-sm transition-all hover:bg-accent/60"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        ) : (
          chat.messages.map((message, index) => {
            const showStreamingCursor =
              isTyping &&
              message.role === "assistant" &&
              index === lastMessageIndex

            return (
              <MessageBubble
                key={message.id}
                message={message}
                user={user}
                showStreamingCursor={showStreamingCursor}
              />
            )
          })
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  )
}
