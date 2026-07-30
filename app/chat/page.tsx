import { HeartPulse } from "lucide-react"

export default function ChatPage() {
  // If there are chats, we might want to redirect to the first one, or just show a welcome screen
  // For this demo, let's just show a beautiful welcome screen if no chat is selected.

  return (
    <div className="flex flex-1 animate-in flex-col items-center justify-center p-8 text-center duration-1000 fade-in">
      <div className="mb-8 flex h-24 w-24 transform items-center justify-center rounded-md bg-gradient-to-br from-teal-400 to-emerald-600 shadow-xl shadow-teal-500/20 transition-transform hover:scale-105">
        <HeartPulse className="h-12 w-12 text-white" />
      </div>
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
        Welcome to Healix
      </h1>
      <p className="mb-8 max-w-lg text-lg font-light text-muted-foreground">
        Your AI-powered healthcare assistant. Select a conversation from the
        sidebar or start a new one to get personalized health insights.
      </p>
    </div>
  )
}
