"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useChatStore } from "@/hooks/store"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserProfile } from "@/lib/types"

interface UserSettingsModalProps {
  open: boolean
  onClose: () => void
}

export function UserSettingsModal({ open, onClose }: UserSettingsModalProps) {
  const { profile, loadProfile, saveProfile } = useChatStore()

  // Initialize formData directly from props. When key changes, React recreates component state.
  const [formData, setFormData] = useState<UserProfile>(profile!)
  const [activeTab, setActiveTab] = useState<"personal" | "memory">("personal")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }
    void loadProfile()
  }, [open, loadProfile])

  if (!open) {
    return null
  }

  const handleSave = async () => {
    setIsSaving(true)
    await saveProfile({
      name: formData.name || undefined,
      email: formData.email || undefined,
      password: formData.password || undefined,
      gender: formData.gender || undefined,
      globalMemory: formData.globalMemory || undefined,
    })
    setIsSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-md border border-border/50 bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">User Settings</h2>
            <p className="text-sm text-muted-foreground">
              Manage profile details and persistent global memory.
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

        <div className="border-b border-border/40 px-5 pt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("personal")}
              className={`rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "personal"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Personal Details
            </button>
            <button
              onClick={() => setActiveTab("memory")}
              className={`rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "memory"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Memory Configuration
            </button>
          </div>
        </div>

        <div className="p-5">
          {activeTab === "personal" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name ?? ""}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  className="h-11 rounded-md bg-background px-3 py-2 text-sm focus:border-teal-500 focus-visible:border-teal-500 focus-visible:ring-0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={formData.email ?? ""}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  className="h-11 rounded-md bg-background px-3 py-2 text-sm focus:border-teal-500 focus-visible:border-teal-500 focus-visible:ring-0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={formData.password ?? ""}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  className="h-11 rounded-md bg-background px-3 py-2 text-sm focus:border-teal-500 focus-visible:border-teal-500 focus-visible:ring-0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <Select
                  value={formData.gender || "_none"}
                  onValueChange={(val) => {
                    const gender = val === "_none" ? "" : val
                    setFormData((prev) => ({ ...prev, gender }))
                  }}
                >
                  <SelectTrigger className="flex !h-11 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-teal-500 focus-visible:border-teal-500 focus-visible:ring-0">
                    <SelectValue placeholder="Select Gender (Optional)" />
                  </SelectTrigger>
                  <SelectContent className="min-w-[200px] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
                    <SelectItem value="_none" className="cursor-pointer">
                      Select Gender (Optional)
                    </SelectItem>
                    <SelectItem value="Male" className="cursor-pointer">
                      Male
                    </SelectItem>
                    <SelectItem value="Female" className="cursor-pointer">
                      Female
                    </SelectItem>
                    <SelectItem value="Other" className="cursor-pointer">
                      Other
                    </SelectItem>
                    <SelectItem
                      value="Prefer not to say"
                      className="cursor-pointer"
                    >
                      Prefer not to say
                    </SelectItem>
                    {formData.gender &&
                      ![
                        "Male",
                        "Female",
                        "Other",
                        "Prefer not to say",
                      ].includes(formData.gender) && (
                        <SelectItem
                          value={formData.gender}
                          className="cursor-pointer"
                        >
                          {formData.gender}
                        </SelectItem>
                      )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-sm font-medium">Global Memory</label>
              <Textarea
                value={formData.globalMemory ?? ""}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    globalMemory: event.target.value,
                  }))
                }
                placeholder={
                  "## Preferences\n- Prefers concise answers\n\n## Ongoing Concerns\n- Seasonal allergies"
                }
                className="min-h-[320px] rounded-md bg-background px-3 py-3 text-sm focus:border-teal-500 focus-visible:border-teal-500 focus-visible:ring-0"
              />
              <p className="text-xs text-muted-foreground">
                Keep this short and structured. Markdown with small headings and
                bullet points works best for readability.
              </p>
            </div>
          )}
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
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}
