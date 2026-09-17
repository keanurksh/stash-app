"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { AuthShell } from "@/components/auth/auth-shell"
import { GoogleButton } from "@/components/auth/google-button"
import { PasswordInput } from "@/components/auth/password-input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { writeRememberMeFlag } from "@/lib/supabase/cookies"

const inputClass =
  "rounded-xl border border-[#1c2225] bg-[#0b0f10] text-slate-200 transition placeholder:text-slate-600 focus:border-[#00f076] focus:ring-1 focus:ring-[#00f076] focus:outline-none"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  const next = searchParams.get("next") ?? "/dashboard"

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    if (error) {
      toast.error("Failed to start login", { description: error.message })
      setGoogleLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      toast.error("Email and password are required")
      return
    }
    setLoading(true)
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) {
      toast.error("Sign in failed", { description: error.message })
      setLoading(false)
      return
    }
    writeRememberMeFlag(rememberMe)
    toast.success("Welcome back")
    router.replace(next)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail.trim()) {
      toast.error("Please enter your email address")
      return
    }
    setForgotLoading(true)
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(
      forgotEmail.trim(),
      { redirectTo: `${window.location.origin}/auth/reset-password` }
    )
    setForgotLoading(false)
    if (error) {
      toast.error("Failed to send reset link", { description: error.message })
      return
    }
    setForgotSent(true)
  }

  return (
    <AuthShell>
      <div className="mb-6">
        <h1 className="font-space text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Welcome Back
        </h1>
        <p className="mt-1.5 font-jakarta text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-[#00f076] transition-colors hover:text-[#b2ffbe]"
          >
            Sign up
          </Link>
        </p>
      </div>

      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium text-slate-300">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className={inputClass}
          />
        </div>

        <PasswordInput
          id="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between pt-0.5">
          <label
            htmlFor="remember-me"
            className="flex cursor-pointer items-center gap-2 text-xs text-zinc-400 select-none"
          >
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 cursor-pointer rounded accent-[#00f076]"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => {
              setForgotEmail(email)
              setForgotSent(false)
              setForgotOpen(true)
            }}
            className="text-xs font-medium text-[#00f076] transition-colors hover:text-[#b2ffbe]"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00f076] px-4 py-3 text-sm font-bold text-[#070a0b] shadow-glow-mint transition hover:bg-[#00dc6c] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="relative my-5 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800" />
        </div>
        <span className="relative bg-[#14191c] px-3 font-space text-[11px] tracking-widest text-zinc-500 uppercase">
          or continue with
        </span>
      </div>

      <GoogleButton loading={googleLoading} onClick={handleGoogleLogin} />

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent
          showCloseButton={false}
          className="w-full max-w-[calc(100%-2rem)] rounded-2xl border border-[#1c2225] bg-[#101415] sm:max-w-sm"
        >
          <DialogTitle className="font-space text-lg font-bold text-white">
            Reset password
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Enter your account email and we will send you a reset link.
          </DialogDescription>
          {forgotSent ? (
            <p className="rounded-xl border border-[#00f076]/30 bg-[#00f076]/10 px-4 py-3 text-xs leading-relaxed text-[#b2ffbe]">
              Reset link sent. Please check your inbox and follow the
              instructions to set a new password.
            </p>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="forgot-email"
                  className="text-xs font-medium text-slate-300"
                >
                  Email Address
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={forgotLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00f076] px-4 py-2.5 text-sm font-bold text-[#070a0b] transition hover:bg-[#00dc6c] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70"
              >
                {forgotLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {forgotLoading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AuthShell>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
