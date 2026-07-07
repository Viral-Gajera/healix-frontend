"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/hooks/use-chat-store";
import { HeartPulse } from "lucide-react";
import { MessageBubble } from "@/components/chat/message-bubble";

interface ChatWindowProps {
  chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { chats, isTyping, user } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chat = chats.find(c => c.id === chatId);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages, isTyping]);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Chat not found.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar relative">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {chat.messages.length === 0 ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-6 opacity-80 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-20 h-20 bg-teal-500/10 rounded-md flex items-center justify-center shadow-inner">
              <HeartPulse className="w-10 h-10 text-teal-500" />
            </div>
            <h2 className="text-2xl font-bold">How can I help you today?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
              {[
                "What are the symptoms of dehydration?",
                "How can I improve my sleep schedule?",
                "Suggest a high-protein vegetarian diet.",
                "What's a good stretch for lower back pain?"
              ].map((suggestion, i) => (
                <div key={i} className="p-4 rounded-md border border-border/50 bg-accent/30 hover:bg-accent/60 cursor-pointer text-sm text-left transition-all">
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        ) : (
          chat.messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              user={user} 
            />
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-4 animate-in fade-in duration-300">
             <div className="shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <HeartPulse className="w-4 h-4" />
              </div>
            </div>
            <div className="px-5 py-4 rounded-md rounded-tl-sm bg-accent/50 border border-border/50 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  );
}
