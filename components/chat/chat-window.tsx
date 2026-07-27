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
  const lastMessageIndex = chat ? chat.messages.length - 1 : -1;
  
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
          chat.messages.map((message, index) => {
            const showStreamingCursor =
              isTyping && message.role === "assistant" && index === lastMessageIndex;

            return (
              <MessageBubble 
                key={message.id} 
                message={message} 
                user={user} 
                showStreamingCursor={showStreamingCursor}
              />
            );
          })
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  );
}
