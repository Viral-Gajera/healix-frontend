"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { useChatStore } from "@/hooks/use-chat-store"
import { useRouter } from "next/navigation"

export function AuthForm() {
  const router = useRouter()
  const { login } = useChatStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    login(name, email)
    router.push("/chat")
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {isLogin ? "Welcome back" : "Create an account"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isLogin
            ? "Enter your credentials to access your Healix dashboard"
            : "Enter your details to get started with Healix"}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-6">
        <div className="space-y-4">
          {!isLogin && (
            <div className="animate-in space-y-2 duration-300 fade-in slide-in-from-top-2">
              <label
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="name"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required={!isLogin}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="flex h-12 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}
          <div className="space-y-2">
            <label
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="m@example.com"
              className="flex h-12 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="password"
              >
                Password
              </label>
              {isLogin && (
                <a
                  href="#"
                  className="text-sm font-medium text-teal-600 transition-colors hover:text-teal-500"
                >
                  Forgot password?
                </a>
              )}
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-12 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group inline-flex h-12 w-full items-center justify-center rounded-md bg-teal-600 text-sm font-medium whitespace-nowrap text-white shadow-lg ring-offset-background transition-all duration-300 hover:bg-teal-700 hover:shadow-teal-600/25 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              {isLogin ? "Sign in" : "Sign up"}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="font-semibold text-teal-600 transition-colors hover:text-teal-500"
        >
          {isLogin ? "Sign up for free" : "Sign in instead"}
        </button>
      </p>
    </div>
  )
}
