import { useChatStore } from "@/hooks/use-chat-store";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Moon, Sun, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function SidebarFooter() {
  const { user, logout, sidebarExpanded } = useChatStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="p-4 border-t border-border/40 space-y-2">
      <div className="flex items-center justify-between">
        <div className={cn("flex items-center gap-3 overflow-hidden transition-all", !sidebarExpanded && "w-0 opacity-0")}>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user?.name || "User"} className="w-9 h-9 rounded-full object-cover ring-2 ring-background border border-border" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="flex flex-col truncate">
            <span className="text-sm font-medium truncate">{user?.name}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
        </div>
        
        <div className={cn("flex items-center", sidebarExpanded ? "gap-1" : "flex-col gap-2 mx-auto")}>
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
