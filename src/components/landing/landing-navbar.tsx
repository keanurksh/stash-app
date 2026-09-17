"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"

import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { BrandLogo } from "@/components/brand-logo"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "#features", label: "Features", highlight: true },
  { href: "#calculator", label: "Kalkulator", highlight: false },
  { href: "#pricing", label: "Pricing", highlight: false },
]

export function LandingNavbar() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[#3b4b3c]/30 bg-[#181c1d]/75 shadow-sm backdrop-blur-sm md:backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:grid md:grid-cols-[1fr_auto_1fr] md:px-8">
        <BrandLogo
          className="justify-self-start md:gap-2"
          textClassName="text-lg text-[#b2ffbe] md:text-xl"
          icon={
            <Image
              src="/logo.png"
              alt="Stash"
              width={32}
              height={32}
              className="size-7 rounded-lg transition-transform duration-150 group-hover:scale-105 md:size-8"
              priority
            />
          }
        />

        <nav className="hidden items-center gap-6 justify-self-center md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-space text-sm font-semibold tracking-[0.02em] transition-colors duration-150 hover:text-[#00f076]",
                link.highlight ? "text-[#b2ffbe]" : "text-[#bacbb8]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:justify-self-end">
          <InteractiveHoverButton
            text="Mulai Gratis"
            onClick={() => router.push("/login")}
            className="w-auto min-w-0 rounded-lg border-[#3b4b3c]/40 bg-[#00f076] px-3 py-2 font-space text-xs text-[#003917] shadow-[0_0_20px_-5px_rgba(0,240,118,0.15)] sm:min-w-36 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
          />
          <button
            type="button"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-9 items-center justify-center rounded-lg border border-[#3b4b3c]/40 text-[#bacbb8] transition-colors hover:border-[#00f076]/40 hover:text-[#00f076] md:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <nav
        className={cn(
          "overflow-hidden border-[#3b4b3c]/30 transition-[max-height,opacity] duration-300 ease-out md:hidden",
          menuOpen ? "max-h-64 border-t opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="flex flex-col gap-1 px-4 py-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "rounded-lg px-3 py-2.5 font-space text-sm font-semibold tracking-[0.02em] transition-colors hover:bg-[#00f076]/10 hover:text-[#00f076]",
                link.highlight ? "text-[#b2ffbe]" : "text-[#bacbb8]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
