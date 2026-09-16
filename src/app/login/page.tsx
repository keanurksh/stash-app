"use client"

import { Suspense, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Eye, ShieldCheck } from "lucide-react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { GoogleIcon } from "@/components/landing/google-icon"

function LoginContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const next = searchParams.get("next") ?? "/dashboard"
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    if (error) {
      toast.error("Gagal memulai login", { description: error.message })
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col justify-between bg-[#0c1012] font-space text-zinc-100 antialiased selection:bg-[#00f076] selection:text-black"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(0, 240, 118, 0.05) 0%, transparent 60%), radial-gradient(circle at 85% 90%, rgba(0, 240, 118, 0.02) 0%, transparent 40%)",
      }}
    >
      {/* Top bar */}
      <header className="z-10 flex w-full items-center justify-between px-6 py-5 sm:px-10">
        <Link
          href="/"
          aria-label="Kembali ke Beranda"
          className="group inline-flex items-center gap-2 text-xs font-medium text-zinc-400 transition-colors duration-150 hover:text-white"
        >
          <ArrowLeft className="size-4 text-zinc-500 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:text-[#00f076]" />
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="hidden items-center gap-2 rounded-full border border-[#283136] bg-[#20272b]/70 px-2.5 py-1 text-[11px] text-zinc-400 sm:flex">
          <span className="size-1.5 animate-pulse rounded-full bg-[#00f076]" />
          <span>Sistem Online</span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        <div className="flex w-full max-w-[420px] flex-col items-center">
          {/* Brand presentation */}
          <div className="mb-7 flex flex-col items-center text-center">
            <div className="group relative mb-3 flex size-12 items-center justify-center rounded-xl border border-[#283136] bg-[#161b1e] shadow-inner">
              <div className="absolute inset-0 rounded-xl bg-[#00f076]/10 blur-sm transition-all duration-200 group-hover:bg-[#00f076]/20" />
              <Image
                src="/logo.png"
                alt="Stash"
                width={24}
                height={24}
                className="relative z-10 size-6"
                priority
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Stash App
            </h1>
          </div>

          {/* Auth card */}
          <section className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[rgba(24,30,34,0.88)] to-[rgba(18,23,26,0.94)] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00f076]/40 to-transparent" />

            <div className="mb-6 text-center">
              <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                Selamat Datang
              </h2>
              <p className="mt-1.5 font-jakarta text-xs leading-relaxed text-zinc-400 sm:text-sm">
                Masuk untuk mulai mencatat dan mengelola keuanganmu tanpa
                ribet.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition-all duration-150 hover:bg-zinc-100 hover:shadow-[0_0_24px_-4px_rgba(0,240,118,0.22)] focus:outline-none focus:ring-2 focus:ring-[#00f076] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-90"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 shrink-0 animate-spin text-zinc-900" />
                    <span>Menghubungkan ke Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="size-4 shrink-0" />
                    <span>Lanjutkan dengan Google</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <span className="relative bg-[#171c1f] px-3 font-space text-[11px] uppercase tracking-widest text-zinc-500">
                  atau
                </span>
              </div>

              <button
                onClick={() => toast.info("Mode demo segera hadir")}
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#283136] bg-[#111517]/80 px-4 py-2.5 text-xs font-medium text-zinc-300 transition-colors duration-150 hover:bg-[#20272b] hover:text-white"
              >
                <Eye className="size-3.5 text-[#00f076]" />
                <span>Coba Versi Demo (Tanpa Akun)</span>
              </button>
            </div>

            <div className="mt-6 border-t border-zinc-800/80 pt-4 text-center">
              <a
                href="#"
                className="text-xs text-zinc-400 transition-colors hover:text-[#00f076]"
              >
                Kendala saat masuk akun? Hubungi Bantuan
              </a>
            </div>
          </section>

          {/* Terms & security */}
          <div className="mt-6 max-w-sm space-y-2 text-center">
            <p className="font-jakarta text-[11px] leading-relaxed text-zinc-400">
              Dengan masuk, kamu menyetujui{" "}
              <Link
                href="/terms"
                className="underline underline-offset-2 transition-colors hover:text-zinc-200"
              >
                Syarat &amp; Ketentuan
              </Link>{" "}
              serta{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-2 transition-colors hover:text-zinc-200"
              >
                Kebijakan Privasi
              </Link>{" "}
              Stash.
            </p>
            <div className="inline-flex items-center gap-1.5 pt-1 font-space text-[11px] text-zinc-400">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>Otorisasi aman via Google OAuth 2.0</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 text-center font-space text-xs text-zinc-400">
        <p>&copy; {new Date().getFullYear()} Stash App.</p>
      </footer>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
