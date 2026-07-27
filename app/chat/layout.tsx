"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useChatStore } from "@/hooks/use-chat-store"
import { Sidebar } from "@/components/chat/sidebar"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, initialize } = useChatStore()
  const router = useRouter()

  useEffect(() => {
    // Basic auth check
    if (!user) {
      router.push("/")
      return
    }
    void initialize()
  }, [user, router, initialize])

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="relative flex h-full min-w-0 flex-1 flex-col">
        {children}
      </main>
    </div>
  )
}
