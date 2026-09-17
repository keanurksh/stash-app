"use client"

import { Loader2 } from "lucide-react"

import { GoogleIcon } from "@/components/landing/google-icon"

interface GoogleButtonProps {
  loading: boolean
  onClick: () => void
  label?: string
}

/** Tombol OAuth Google bersama dengan state loading. */
export function GoogleButton({
  loading,
  onClick,
  label = "Continue with Google",
}: GoogleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      type="button"
      className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition-all duration-150 hover:bg-zinc-100 hover:shadow-[0_0_24px_-4px_rgba(0,240,118,0.22)] focus:ring-2 focus:ring-[#00f076] focus:outline-none active:scale-[0.99] disabled:pointer-events-none disabled:opacity-90"
    >
      {loading ? (
        <>
          <Loader2 className="size-4 shrink-0 animate-spin text-zinc-900" />
          <span>Connecting to Google...</span>
        </>
      ) : (
        <>
          <GoogleIcon className="size-4 shrink-0" />
          <span>{label}</span>
        </>
      )}
    </button>
  )
}
