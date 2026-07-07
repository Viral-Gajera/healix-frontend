"use client";

import { useChatStore } from "@/hooks/use-chat-store";
import { useRouter, useParams } from "next/navigation";
import {
  HeartPulse,
  MessageSquare,
  Plus,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarFooter } from "@/components/chat/sidebar-footer";

export function Sidebar() {
  const {
    chats,
    createNewChat,
    deleteChat,
    sidebarExpanded,
    setSidebarExpanded
  } = useChatStore();
  const router = useRouter();
  const params = useParams();

  const handleNewChat = () => {
    const newChatId = createNewChat();
    router.push(`/chat/${newChatId}`);
  };

  const handleSelectChat = (id: string) => {
    router.push(`/chat/${id}`);
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-background border-r border-border/40 transition-all duration-300 ease-in-out relative",
        sidebarExpanded ? "w-72" : "w-[72px]"
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between h-[72px] border-b border-border/40">
        <div className={cn("flex items-center gap-3 overflow-hidden transition-all", !sidebarExpanded && "w-0 opacity-0")}>
          <div className="p-2 bg-teal-500/10 rounded-md text-teal-600 dark:text-teal-400">
            <HeartPulse className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg whitespace-nowrap tracking-tight">Healix</span>
        </div>

        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title={sidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {sidebarExpanded ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className={cn(
            "flex items-center justify-center gap-2 w-full bg-teal-600 hover:bg-teal-700 text-white rounded-md h-11 transition-all shadow-sm shadow-teal-600/20",
            !sidebarExpanded && "px-0"
          )}
        >
          <Plus className="w-5 h-5" />
          {sidebarExpanded && <span className="font-medium">New Chat</span>}
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1 py-2 custom-scrollbar">
        {chats.length === 0 && sidebarExpanded && (
          <div className="text-center p-4 text-sm text-muted-foreground mt-4">
            No chats yet. Start a new conversation.
          </div>
        )}

        {chats.map(chat => {
          const isActive = params.chatId === chat.id;
          return (
            <div
              key={chat.id}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all border border-transparent",
                isActive
                  ? "bg-accent text-accent-foreground border-border/50 shadow-sm"
                  : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
              )}
              onClick={() => handleSelectChat(chat.id)}
            >
              <MessageSquare className={cn("w-5 h-5 shrink-0", isActive && "text-teal-500")} />

              {sidebarExpanded && (
                <>
                  <div className="flex-1 truncate text-sm font-medium">
                    {chat.title}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                      if (isActive) router.push('/chat');
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer (User & Settings) */}
      <SidebarFooter />
    </div>
  );
}
