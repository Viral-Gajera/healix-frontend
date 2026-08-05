/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useChatStore } from "@/hooks/store"
import { Sidebar } from "@/components/chat/sidebar"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { profile, initialize } = useChatStore()

  useEffect(() => {
    if (!profile) {
      router.push("/")
      return
    }
    void initialize()
  }, [profile?.id])

  if (!profile) return null

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="relative flex h-full min-w-0 flex-1 flex-col">
        {children}
      </main>
    </div>
  )
}
