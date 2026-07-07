import React from "react";
import { Message, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { HeartPulse, User as UserIcon } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  user: User | null;
}

export const MessageBubble = React.memo(function MessageBubble({ message, user }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div 
      className={cn(
        "flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className="shrink-0 mt-1">
        {isUser ? (
          user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="User" className="w-8 h-8 rounded-full object-cover ring-2 ring-background border border-border" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
              <UserIcon className="w-5 h-5" />
            </div>
          )
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <HeartPulse className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Message Bubble */}
      <div 
        className={cn(
          "flex flex-col max-w-[80%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div 
          className={cn(
            "px-5 py-3.5 rounded-md text-[15px] leading-relaxed shadow-sm",
            isUser 
              ? "bg-teal-600 text-white rounded-tr-sm" 
              : "bg-accent/50 border border-border/50 text-foreground rounded-tl-sm"
          )}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
             {message.content}
          </div>
        </div>
        <span className="text-[11px] text-muted-foreground mt-1.5 px-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(new Date(message.createdAt))}
        </span>
      </div>
    </div>
  );
});
