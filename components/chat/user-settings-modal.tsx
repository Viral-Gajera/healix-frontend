"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useChatStore } from "@/hooks/use-chat-store"

interface UserSettingsModalProps {
  open: boolean
  onClose: () => void
}

export function UserSettingsModal({ open, onClose }: UserSettingsModalProps) {
  const {
    profile,
    globalMemory,
    loadProfile,
    loadGlobalMemory,
    saveProfile,
    saveGlobalMemory,
  } = useChatStore()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [gender, setGender] = useState("")
  const [memoryDraft, setMemoryDraft] = useState("")
  const [activeTab, setActiveTab] = useState<"personal" | "memory">("personal")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }
    void loadProfile()
    void loadGlobalMemory()
  }, [open, loadProfile, loadGlobalMemory])

  useEffect(() => {
    if (!open || !profile) {
      return
    }
    setName(profile.name)
    setEmail(profile.email)
    setPassword(profile.password || "")
    setGender(profile.gender || "")
  }, [open, profile])

  useEffect(() => {
    if (!open) {
      return
    }
    setMemoryDraft(globalMemory)
  }, [open, globalMemory])

  if (!open) {
    return null
  }

  const handleSave = async () => {
    setIsSaving(true)
    await saveProfile({
      name,
      email,
      password,
      gender,
      settings: profile?.settings || {},
    })
    await saveGlobalMemory(memoryDraft)
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
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <select
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                  className="flex h-11 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-teal-500"
                >
                  <option value="" className="bg-background text-foreground">
                    Select Gender (Optional)
                  </option>
                  <option
                    value="Male"
                    className="bg-background text-foreground"
                  >
                    Male
                  </option>
                  <option
                    value="Female"
                    className="bg-background text-foreground"
                  >
                    Female
                  </option>
                  <option
                    value="Other"
                    className="bg-background text-foreground"
                  >
                    Other
                  </option>
                  <option
                    value="Prefer not to say"
                    className="bg-background text-foreground"
                  >
                    Prefer not to say
                  </option>
                  {gender &&
                    !["Male", "Female", "Other", "Prefer not to say"].includes(
                      gender
                    ) && (
                      <option
                        value={gender}
                        className="bg-background text-foreground"
                      >
                        {gender}
                      </option>
                    )}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-sm font-medium">Global Memory</label>
              <textarea
                value={memoryDraft}
                onChange={(event) => setMemoryDraft(event.target.value)}
                placeholder={
                  "## Preferences\n- Prefers concise answers\n\n## Ongoing Concerns\n- Seasonal allergies"
                }
                className="min-h-[320px] w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus:border-teal-500"
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
