"use client";

import { use, useEffect } from "react";
import { ChatWindow } from "@/components/chat/chat-window";
import { ChatInput } from "@/components/chat/chat-input";
import { useChatStore } from "@/hooks/use-chat-store";
import { useRouter } from "next/navigation";

export default function ChatIdPage({ params }: { params: Promise<{ chatId: string }> }) {
  // In Next.js 15, params is a Promise, so we must `use()` it.
  const resolvedParams = use(params);
  const chatId = resolvedParams.chatId;
  const { chats, setActiveChatId } = useChatStore();
  const router = useRouter();

  useEffect(() => {
    setActiveChatId(chatId);
    return () => setActiveChatId(null);
  }, [chatId, setActiveChatId]);

  const chatExists = chats.some(c => c.id === chatId);

  useEffect(() => {
    if (!chatExists && chats.length > 0) {
      // If chat doesn't exist, redirect to chat home
      router.push("/chat");
    }
  }, [chatExists, chats.length, router]);

  if (!chatExists) return null;

  return (
    <>
      {/* Header for mobile or just extra context */}
      <div className="h-14 border-b border-border/40 flex items-center px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 shrink-0">
        <h1 className="font-semibold text-sm truncate">
          {chats.find(c => c.id === chatId)?.title || 'New Chat'}
        </h1>
      </div>
      
      <ChatWindow chatId={chatId} />
      <ChatInput chatId={chatId} />
    </>
  );
}
