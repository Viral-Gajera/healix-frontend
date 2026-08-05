"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useChatStore } from "@/hooks/store"

interface ChatMemoryModalProps {
  chatId: string
  open: boolean
  onClose: () => void
}

export function ChatMemoryModal({
  chatId,
  open,
  onClose,
}: ChatMemoryModalProps) {
  const { chatMemories, loadChatMemory, saveChatMemory } = useChatStore()
  const [memoryDraft, setMemoryDraft] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }
    void (async () => {
      await loadChatMemory(chatId)
      setMemoryDraft(chatMemories[chatId] || "")
    })()
  }, [open, chatId])

  if (!open) {
    return null
  }

  const handleSave = async () => {
    setIsSaving(true)
    await saveChatMemory(chatId, memoryDraft)
    setIsSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-xl rounded-md border border-border/50 bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">Chat Memory</h2>
            <p className="text-sm text-muted-foreground">
              Review and edit the memory stored for this chat.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <textarea
            value={memoryDraft}
            onChange={(event) => setMemoryDraft(event.target.value)}
            placeholder="Session-specific memory for this chat..."
            className="min-h-[260px] w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus:border-teal-500"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Use this for chat-specific follow-ups, unresolved details, and
            temporary context.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/40 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              void handleSave()
            }}
            disabled={isSaving}
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Memory"}
          </button>
        </div>
      </div>
    </div>
  )
}
