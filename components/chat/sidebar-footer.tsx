/* eslint-disable @next/next/no-img-element */
import { useChatStore } from "@/hooks/store"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Moon, Sun, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { UserSettingsModal } from "@/components/chat/user-settings-modal"

export function SidebarFooter() {
  const { profile, logout, sidebarExpanded } = useChatStore()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <>
      <div className="space-y-2 border-t border-border/40 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSettingsOpen(true)}
            className={cn(
              "flex flex-1 items-center gap-3 overflow-hidden rounded-md p-1 text-left transition-all hover:bg-accent/50",
              !sidebarExpanded && "w-0 opacity-0"
            )}
            title="Open settings"
          >
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile?.name || "User"}
                className="h-9 w-9 rounded-full border border-border object-cover ring-2 ring-background"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-700 dark:bg-teal-900/50 dark:text-teal-400">
                {profile?.name?.charAt(0) || "U"}
              </div>
            )}
            <div className="flex flex-col truncate">
              <span className="truncate text-sm font-medium">
                {profile?.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {profile?.email}
              </span>
            </div>
          </button>

          <div
            className={cn(
              "flex items-center",
              sidebarExpanded ? "gap-1" : "mx-auto flex-col gap-2"
            )}
          >
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-md p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                title="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="rounded-md p-2.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <UserSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  )
}
