"use client"

import { useRouter } from "next/navigation"

import {
  InteractiveHoverButton,
} from "@/components/ui/interactive-hover-button"

export function LoginCtaButton() {
  const router = useRouter()

  return (
    <InteractiveHoverButton
      text="Mulai Sekarang"
      onClick={() => router.push("/login")}
      className="w-auto min-w-44 px-6 text-sm sm:text-base"
    />
  )
}
