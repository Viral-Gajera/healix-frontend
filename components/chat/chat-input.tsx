"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/hooks/use-chat-store"

interface ChatInputProps {
  chatId: string
}

export function ChatInput({ chatId }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { sendMessage, isTyping } = useChatStore()

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [message])

  const handleSend = async () => {
    if (message.trim() && !isTyping) {
      await sendMessage(chatId, message.trim())
      setMessage("")
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  return (
    <div className="relative z-10 w-full border-t border-border/40 bg-background/80 p-4 backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-4xl items-end gap-2 rounded-md border border-border/50 bg-accent/30 p-2 transition-all focus-within:border-teal-500/50 focus-within:ring-2 focus-within:ring-teal-500/50">
        <button
          className="shrink-0 rounded-md p-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Attach File (Mock)"
          onClick={() => alert("File attachment is mocked for this demo.")}
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Healix about your health..."
          className="custom-scrollbar max-h-[200px] flex-1 resize-none border-none bg-transparent px-2 py-3 text-[15px] leading-relaxed outline-none focus:ring-0"
          rows={1}
          disabled={isTyping}
        />

        <button
          onClick={() => {
            void handleSend()
          }}
          disabled={!message.trim() || isTyping}
          className={cn(
            "mb-0.5 flex shrink-0 items-center justify-center rounded-md p-3 transition-all",
            message.trim() && !isTyping
              ? "bg-teal-600 text-white shadow-md hover:bg-teal-700"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          )}
        >
          {isTyping ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="ml-0.5 h-5 w-5" />
          )}
        </button>
      </div>
      <div className="mt-2 text-center">
        <span className="text-xs font-medium text-muted-foreground">
          Healix can make mistakes. Consider verifying critical medical
          information with a professional.
        </span>
      </div>
    </div>
  )
}
