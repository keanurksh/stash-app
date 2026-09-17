"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"

import { createClient } from "@/lib/supabase/client"

/**
 * Hanya izinkan redirect internal (path relatif dengan satu slash di depan).
 * Mencegah open-redirect: ?next=https://evil.com atau ?next=//evil.com
 * selalu jatuh kembali ke /dashboard.
 */
function getSafeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard"
  }
  return next
}

export function CallbackProcessor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [failed, setFailed] = useState(false)
  // Dedup exchange per code: semua mount (termasuk StrictMode double-invoke
  // yang memakai instance & ref yang sama) meng-await promise yang sama,
  // sehingga code sekali pakai tidak pernah di-exchange dua kali dan tidak
  // ada percobaan yang saling membatalkan.
  const inFlightRef = useRef<{
    code: string
    promise: Promise<"ok" | "fail">
  } | null>(null)

  const code = searchParams.get("code")

  useEffect(() => {
    if (!code) return

    const next = getSafeNextPath(searchParams.get("next"))

    if (inFlightRef.current?.code !== code) {
      const supabase = createClient()
      const run = async (): Promise<"ok" | "fail"> => {
        try {
          // Fast path: sesi sudah ada, lewati exchange.
          const { data: existing } = await supabase.auth.getSession()
          if (existing.session) return "ok"
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (!error) return "ok"
        } catch {
          // Gagal jaringan/dll — verifikasi sesi di bawah sebelum vonis.
        }
        try {
          const { data: retry } = await supabase.auth.getSession()
          return retry.session ? "ok" : "fail"
        } catch {
          return "fail"
        }
      }
      inFlightRef.current = { code, promise: run() }
    }

    let cancelled = false
    inFlightRef.current.promise.then((result) => {
      if (cancelled) return
      if (result === "ok") {
        router.replace(next)
      } else {
        setFailed(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [router, searchParams, code])

  if (!code || failed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0c1012] px-4 text-center">
        <p className="font-space text-lg font-bold text-white">
          Login gagal diproses
        </p>
        <p className="max-w-xs font-jakarta text-sm text-zinc-400">
          Sesi login kedaluwarsa atau tidak valid. Silakan coba masuk kembali.
        </p>
        <Link
          href="/login"
          className="rounded-xl bg-[#00f076] px-5 py-2.5 text-sm font-bold text-[#070a0b] transition hover:bg-[#00dc6c]"
        >
          Kembali ke Login
        </Link>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0c1012] px-4 text-center"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 40%, rgba(0, 240, 118, 0.07) 0%, transparent 55%)",
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [1, 0.85, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/logo.png"
          alt="Stash"
          width={64}
          height={64}
          className="size-16 rounded-2xl"
          priority
        />
      </motion.div>
      <div className="space-y-2">
        <p className="font-space text-base font-semibold text-white">
          Menyiapkan workspace keuangan Anda
          <AnimatedDots />
        </p>
        <p className="font-jakarta text-xs text-zinc-500">
          Memverifikasi sesi Google kamu, mohon tunggu sebentar.
        </p>
      </div>
    </div>
  )
}

function AnimatedDots() {
  return (
    <span className="inline-flex" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        >
          .
        </motion.span>
      ))}
    </span>
  )
}
