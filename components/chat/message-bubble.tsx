import React from "react"
import { Message, UserProfile } from "@/lib/types"
import { cn } from "@/lib/utils"
import { HeartPulse, User as UserIcon } from "lucide-react"

interface MessageBubbleProps {
  message: Message
  user: UserProfile | null
  showStreamingCursor?: boolean
}

export const MessageBubble = React.memo(function MessageBubble({
  message,
  user,
  showStreamingCursor = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "group flex animate-in gap-4 duration-300 fade-in slide-in-from-bottom-2",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className="mt-1 shrink-0">
        {isUser ? (
          user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="User"
              className="h-8 w-8 rounded-full border border-border object-cover ring-2 ring-background"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-800">
              <UserIcon className="h-5 w-5" />
            </div>
          )
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-md shadow-teal-500/20">
            <HeartPulse className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={cn(
          "flex max-w-[100%] flex-col",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-md px-5 py-3.5 text-[15px] leading-relaxed shadow-sm",
            isUser
              ? "rounded-tr-sm bg-teal-600 text-white"
              : "rounded-tl-sm border border-border/50 bg-accent/50 text-foreground"
          )}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            {message.content}
            {showStreamingCursor && (
              <span
                aria-hidden="true"
                className="ml-1 inline-block h-[1em] w-1.5 animate-pulse bg-current align-[-0.1em]"
              />
            )}
          </div>
        </div>
        <span className="mt-1.5 px-1 text-[11px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          {new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
          }).format(new Date(message.createdAt))}
        </span>
      </div>
    </div>
  )
})
