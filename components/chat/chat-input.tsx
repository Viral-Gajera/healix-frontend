"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/hooks/use-chat-store";

interface ChatInputProps {
  chatId: string;
}

export function ChatInput({ chatId }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isTyping } = useChatStore();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !isTyping) {
      sendMessage(chatId, message.trim());
      setMessage("");
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-background/80 backdrop-blur-xl border-t border-border/40 w-full relative z-10">
      <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-accent/30 p-2 rounded-md border border-border/50 focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:border-teal-500/50 transition-all">
        
        <button 
          className="p-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors shrink-0"
          title="Attach File (Mock)"
          onClick={() => alert("File attachment is mocked for this demo.")}
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Healix about your health..."
          className="flex-1 max-h-[200px] bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-[15px] leading-relaxed custom-scrollbar outline-none"
          rows={1}
          disabled={isTyping}
        />
        
        <button
          onClick={handleSend}
          disabled={!message.trim() || isTyping}
          className={cn(
            "p-3 rounded-md flex items-center justify-center transition-all shrink-0 mb-0.5",
            message.trim() && !isTyping
              ? "bg-teal-600 text-white hover:bg-teal-700 shadow-md" 
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isTyping ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 ml-0.5" />
          )}
        </button>
      </div>
      <div className="text-center mt-2">
        <span className="text-xs text-muted-foreground font-medium">
          Healix can make mistakes. Consider verifying critical medical information with a professional.
        </span>
      </div>
    </div>
  );
}
