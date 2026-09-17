"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CircleCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { AuthShell } from "@/components/auth/auth-shell"
import { PasswordInput } from "@/components/auth/password-input"

type Phase = "verifying" | "ready" | "invalid" | "done"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phase, setPhase] = useState<Phase>("verifying")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [saving, setSaving] = useState(false)

  // Tukar code recovery menjadi sesi agar updateUser diizinkan
  const code = searchParams.get("code")

  useEffect(() => {
    if (!code) return
    let cancelled = false
    import("@/lib/supabase/client").then(async ({ createClient }) => {
      const supabase = createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!cancelled) {
        setPhase(error ? "invalid" : "ready")
      }
    })
    return () => {
      cancelled = true
    }
  }, [searchParams, code])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    if (password !== confirm) {
      toast.error("Passwords do not match")
      return
    }
    setSaving(true)
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (error) {
      toast.error("Failed to update password", { description: error.message })
      return
    }
    setPhase("done")
    toast.success("Password updated. Redirecting to dashboard")
    setTimeout(() => router.replace("/dashboard"), 1200)
  }

  return (
    <AuthShell>
      <div className="mb-6">
        <h1 className="font-space text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Reset Password
        </h1>
        <p className="mt-1.5 font-jakarta text-sm text-zinc-400">
          Choose a new password for your account.
        </p>
      </div>

      {phase === "verifying" ? (
        !code ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm leading-relaxed text-rose-200">
            This reset link is invalid or has expired. Please request a new
            one from the login page.
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-[#1c2225] bg-[#0b0f10] px-5 py-4 text-sm text-zinc-300">
            <Loader2 className="size-4 shrink-0 animate-spin text-[#00f076]" />
            Verifying reset link...
          </div>
        )
      ) : phase === "invalid" ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm leading-relaxed text-rose-200">
          This reset link is invalid or has expired. Please request a new one
          from the login page.
        </div>
      ) : phase === "done" ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#00f076]/30 bg-[#00f076]/10 px-5 py-8 text-center">
          <CircleCheck className="size-8 text-[#00f076]" />
          <p className="font-space text-base font-bold text-white">
            Password updated
          </p>
          <p className="font-jakarta text-xs text-zinc-300">
            Taking you to your dashboard...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            id="new-password"
            label="New Password"
            value={password}
            onChange={setPassword}
            placeholder="Minimum 6 characters"
            autoComplete="new-password"
          />
          <PasswordInput
            id="confirm-password"
            label="Confirm New Password"
            value={confirm}
            onChange={setConfirm}
            placeholder="Repeat your new password"
            autoComplete="new-password"
          />
          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00f076] px-4 py-3 text-sm font-bold text-[#070a0b] shadow-glow-mint transition hover:bg-[#00dc6c] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {saving ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
