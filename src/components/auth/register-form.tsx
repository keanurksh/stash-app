"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CircleCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { AuthShell } from "@/components/auth/auth-shell"
import { GoogleButton } from "@/components/auth/google-button"
import { PasswordInput } from "@/components/auth/password-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const inputClass =
  "rounded-xl border border-[#1c2225] bg-[#0b0f10] text-slate-200 transition placeholder:text-slate-600 focus:border-[#00f076] focus:ring-1 focus:ring-[#00f076] focus:outline-none"

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !password) {
      toast.error("Please fill in all fields")
      return
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    if (!agreed) {
      toast.error("Please agree to the Terms & Conditions first")
      return
    }
    setLoading(true)
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    })
    if (error) {
      toast.error("Registration failed", { description: error.message })
      setLoading(false)
      return
    }
    if (data.session) {
      toast.success("Account created. Welcome aboard")
      router.replace(next)
      return
    }
    // Email confirmation required — no active session yet
    setLoading(false)
    setNeedsConfirmation(true)
  }

  return (
    <AuthShell>
      <div className="mb-6">
        <h1 className="font-space text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Create an Account
        </h1>
        <p className="mt-1.5 font-jakarta text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#00f076] transition-colors hover:text-[#b2ffbe]"
          >
            Log in
          </Link>
        </p>
      </div>

      {needsConfirmation ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#00f076]/30 bg-[#00f076]/10 px-5 py-8 text-center">
          <CircleCheck className="size-8 text-[#00f076]" />
          <p className="font-space text-base font-bold text-white">
            Almost there
          </p>
          <p className="max-w-xs font-jakarta text-xs leading-relaxed text-zinc-300">
            We sent a confirmation link to{" "}
            <span className="font-medium text-white">{email}</span>. Open it to
            activate your account, then log in.
          </p>
          <Link
            href="/login"
            className="mt-1 rounded-xl bg-[#00f076] px-5 py-2.5 text-sm font-bold text-[#070a0b] transition hover:bg-[#00dc6c]"
          >
            Go to Login
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="full-name"
                className="text-xs font-medium text-slate-300"
              >
                Full Name
              </Label>
              <Input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-medium text-slate-300"
              >
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
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
            />

            <label
              htmlFor="agree-terms"
              className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-zinc-400 select-none"
            >
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 cursor-pointer rounded accent-[#00f076]"
              />
              <span>
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-medium text-[#00f076] underline underline-offset-2 transition-colors hover:text-[#b2ffbe]"
                >
                  Terms &amp; Conditions
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00f076] px-4 py-3 text-sm font-bold text-[#070a0b] shadow-glow-mint transition hover:bg-[#00dc6c] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {loading ? "Creating account..." : "Create Account"}
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
        </>
      )}
    </AuthShell>
  )
}
