"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/hooks/use-chat-store";
import { Sidebar } from "@/components/chat/sidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useChatStore();
  const router = useRouter();

  useEffect(() => {
    // Basic auth check
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {children}
      </main>
    </div>
  );
}
