"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  /** Elemen ikon/logo di kiri teks */
  icon: React.ReactNode
  className?: string
  textClassName?: string
  /**
   * Href awal sebelum status sesi diketahui (menghindari flash link salah).
   * Header yang pasti authed (dashboard/admin) isi "/dashboard".
   */
  defaultHref?: string
}

/**
 * Logo + teks "Stash" dengan navigasi sadar-auth:
 * guest -> Landing Page (/), user login -> Main Overview Dashboard (/dashboard).
 */
export function BrandLogo({
  icon,
  className,
  textClassName,
  defaultHref = "/",
}: BrandLogoProps) {
  const [href, setHref] = useState(defaultHref)

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) setHref("/dashboard")
      })
  }, [])

  return (
    <Link
      href={href}
      aria-label="Stash"
      className={cn("group flex items-center gap-2", className)}
    >
      {icon}
      <span
        className={cn(
          "font-space text-xl font-bold tracking-tight",
          textClassName ?? "text-white"
        )}
      >
        Stash
      </span>
    </Link>
  )
}
