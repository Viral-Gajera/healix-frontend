"use client"

import { useChatStore } from "@/hooks/use-chat-store"
import { useRouter, useParams } from "next/navigation"
import {
  HeartPulse,
  MessageSquare,
  Plus,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarFooter } from "@/components/chat/sidebar-footer"

export function Sidebar() {
  const {
    chats,
    createNewChat,
    deleteChat,
    sidebarExpanded,
    setSidebarExpanded,
  } = useChatStore()
  const router = useRouter()
  const params = useParams()

  const handleNewChat = () => {
    const newChatId = createNewChat()
    router.push(`/chat/${newChatId}`)
  }

  const handleSelectChat = (id: string) => {
    router.push(`/chat/${id}`)
  }

  return (
    <div
      className={cn(
        "relative flex flex-col border-r border-border/40 bg-background transition-all duration-300 ease-in-out",
        sidebarExpanded ? "w-72" : "w-18"
      )}
    >
      {/* Header */}
      <div className="flex h-18 items-center justify-between border-b border-border/40 p-4">
        <div
          className={cn(
            "flex items-center gap-3 overflow-hidden transition-all",
            !sidebarExpanded && "w-0 opacity-0"
          )}
        >
          <div className="rounded-md bg-teal-500/10 p-2 text-teal-600 dark:text-teal-400">
            <HeartPulse className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight whitespace-nowrap">
            Healix
          </span>
        </div>

        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title={sidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {sidebarExpanded ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className={cn(
            "flex h-11 w-full items-center justify-center gap-2 rounded-md bg-teal-600 text-white shadow-sm shadow-teal-600/20 transition-all hover:bg-teal-700",
            !sidebarExpanded && "px-0"
          )}
        >
          <Plus className="h-5 w-5" />
          {sidebarExpanded && <span className="font-medium">New Chat</span>}
        </button>
      </div>

      {/* Chat List */}
      <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {chats.length === 0 && sidebarExpanded && (
          <div className="mt-4 p-4 text-center text-sm text-muted-foreground">
            No chats yet. Start a new conversation.
          </div>
        )}

        {chats.map((chat) => {
          const isActive = params.chatId === chat.id
          return (
            <div
              key={chat.id}
              className={cn(
                "group flex cursor-pointer items-center gap-3 rounded-md border border-border/50 px-3 py-2 transition-all",
                isActive
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
              onClick={() => handleSelectChat(chat.id)}
            >
              <MessageSquare
                className={cn("h-7 w-6 shrink-0", isActive && "text-teal-500")}
              />

              {sidebarExpanded && (
                <>
                  <div className="flex-1 truncate text-sm font-medium">
                    {chat.title}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteChat(chat.id)
                      if (isActive) router.push("/chat")
                    }}
                    className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer (User & Settings) */}
      <SidebarFooter />
    </div>
  )
}
