"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useChatStore } from "@/hooks/use-chat-store"
import { Activity, HeartPulse, Sparkles } from "lucide-react"
import { AuthForm } from "@/components/auth/auth-form"

export default function Page() {
  const router = useRouter()
  const user = useChatStore((state) => state.user)

  useEffect(() => {
    if (user) {
      router.push("/chat")
    }
  }, [user, router])

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row dark:bg-[#0a0a0a]">
      {/* Left side - Branding/Decor */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-900 md:flex">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] animate-pulse rounded-full bg-teal-400/30 blur-3xl" />
        <div className="absolute -right-32 -bottom-32 h-[400px] w-[400px] animate-pulse rounded-full bg-emerald-300/20 blur-3xl delay-1000" />

        <div className="relative z-10 flex flex-col items-center p-12 text-center text-white">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-md border border-white/30 bg-white/20 p-3 shadow-xl backdrop-blur-md">
              <HeartPulse className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight">Healix</h1>
          </div>
          <p className="max-w-md text-xl leading-relaxed font-light text-teal-50">
            Your personal, intelligent healthcare companion. Available 24/7 for
            preliminary guidance and support.
          </p>

          <div className="mt-16 grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2 rounded-md border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-teal-200" />
              <span className="text-sm font-medium">AI-Powered</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-md border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <Activity className="h-6 w-6 text-emerald-200" />
              <span className="text-sm font-medium">Health Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex flex-1 flex-col justify-center px-8 sm:px-16 lg:px-24">
        <AuthForm />
      </div>
    </div>
  )
}
