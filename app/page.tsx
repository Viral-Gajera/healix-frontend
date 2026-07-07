"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/hooks/use-chat-store";
import { Activity, HeartPulse, Sparkles } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";

export default function Page() {
  const router = useRouter();
  const user = useChatStore((state) => state.user);

  useEffect(() => {
    if (user) {
      router.push("/chat");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background dark:bg-[#0a0a0a]">
      {/* Left side - Branding/Decor */}
      <div className="hidden md:flex w-1/2 relative bg-gradient-to-br from-teal-500 to-emerald-900 overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute w-[500px] h-[500px] bg-teal-400/30 rounded-full blur-3xl -top-32 -left-32 animate-pulse" />
        <div className="absolute w-[400px] h-[400px] bg-emerald-300/20 rounded-full blur-3xl -bottom-32 -right-32 animate-pulse delay-1000" />
        
        <div className="relative z-10 flex flex-col items-center text-white p-12 text-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/20 rounded-md backdrop-blur-md shadow-xl border border-white/30">
              <HeartPulse className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight">Healix</h1>
          </div>
          <p className="text-xl text-teal-50 max-w-md font-light leading-relaxed">
            Your personal, intelligent healthcare companion. Available 24/7 for preliminary guidance and support.
          </p>
          
          <div className="mt-16 grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-md flex flex-col items-center gap-2">
              <Sparkles className="w-6 h-6 text-teal-200" />
              <span className="text-sm font-medium">AI-Powered</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-md flex flex-col items-center gap-2">
              <Activity className="w-6 h-6 text-emerald-200" />
              <span className="text-sm font-medium">Health Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <AuthForm />
      </div>
    </div>
  );
}
