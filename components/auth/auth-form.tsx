"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";
import { useRouter } from "next/navigation";

export function AuthForm() {
  const router = useRouter();
  const { login } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      login();
      router.push("/chat");
    }, 1000);
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {isLogin ? "Welcome back" : "Create an account"}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          {isLogin 
            ? "Enter your credentials to access your Healix dashboard"
            : "Enter your details to get started with Healix"}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-6">
        <div className="space-y-4">
          {!isLogin && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required={!isLogin}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="flex h-12 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="m@example.com"
              className="flex h-12 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                Password
              </label>
              {isLogin && (
                <a href="#" className="text-sm text-teal-600 hover:text-teal-500 font-medium transition-colors">
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
              className="flex h-12 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:pointer-events-none disabled:opacity-50 bg-teal-600 text-white hover:bg-teal-700 h-12 w-full shadow-lg hover:shadow-teal-600/25 group"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {isLogin ? "Sign in" : "Sign up"}
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button 
          type="button" 
          onClick={() => setIsLogin(!isLogin)}
          className="font-semibold text-teal-600 hover:text-teal-500 transition-colors"
        >
          {isLogin ? "Sign up for free" : "Sign in instead"}
        </button>
      </p>
    </div>
  );
}
