import { HeartPulse } from "lucide-react";

export default function ChatPage() {

  // If there are chats, we might want to redirect to the first one, or just show a welcome screen
  // For this demo, let's just show a beautiful welcome screen if no chat is selected.
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
      <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-md flex items-center justify-center shadow-xl shadow-teal-500/20 mb-8 transform hover:scale-105 transition-transform">
        <HeartPulse className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">Welcome to Healix</h1>
      <p className="text-lg text-muted-foreground max-w-lg mb-8 font-light">
        Your AI-powered healthcare assistant. Select a conversation from the sidebar or start a new one to get personalized health insights.
      </p>
    </div>
  );
}
