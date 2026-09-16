"use client"

import { useEffect, useState } from "react"
import { LayoutDashboard, LogOut, Plus, ReceiptText, Sparkles, Target, User } from "lucide-react"
import { toast } from "sonner"

import { PaywallModal } from "@/components/paywall/paywall-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { getInitials } from "@/lib/format"
import { usePlanStatus } from "@/lib/plan-gate"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { DashboardUser } from "@/types"

interface MobileBottomNavProps {
  user: DashboardUser
  onAddClick: () => void
}

const SECTION_IDS = ["overview", "transaksi", "wishlist"] as const

function ProfileSheet({
  open,
  onOpenChange,
  user,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: DashboardUser
}) {
  const [paywallOpen, setPaywallOpen] = useState(false)
  const { isPro, loading: planLoading } = usePlanStatus()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Berhasil keluar")
    window.location.replace("/")
  }

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="border-[#1c2225] bg-[#101415] pb-[env(safe-area-inset-bottom)]">
          <div className="flex flex-col items-center gap-1 px-6 pt-2 pb-6 text-center">
            <Avatar className="size-16 rounded-full ring-2 ring-[#00f076]/40">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              ) : null}
              <AvatarFallback className="rounded-full bg-[#1c2225] text-lg font-semibold text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <p className="mt-2 truncate text-base font-semibold text-white">
              {user.name}
            </p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
            <div className="mt-2">
              {planLoading ? (
                <span className="inline-block h-5 w-16 animate-pulse rounded-full bg-[#1c2225]" />
              ) : isPro ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#00f076]/30 bg-[#00f076]/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[#00f076]">
                  <Sparkles className="size-3" />
                  PRO PLAN
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-600 bg-slate-700/40 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-slate-300">
                  FREE PLAN
                </span>
              )}
            </div>
            {!isPro && !planLoading ? (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false)
                  setPaywallOpen(true)
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00f076] px-4 py-3 text-sm font-bold text-[#070a0b] shadow-glow-mint transition hover:bg-[#00dc6c] active:scale-[0.99]"
              >
                <Sparkles className="size-4" />
                Upgrade to Pro
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/20 active:scale-[0.99]"
            >
              <LogOut className="size-4" />
              Keluar
            </button>
          </div>
        </DrawerContent>
      </Drawer>
      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </>
  )
}

export function MobileBottomNav({ user, onAddClick }: MobileBottomNavProps) {
  const [active, setActive] = useState<string>("overview")
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        let current: string = SECTION_IDS[0]
        for (const id of SECTION_IDS) {
          const el = document.getElementById(id)
          if (el && el.getBoundingClientRect().top <= 160) {
            current = id
          }
        }
        setActive(current)
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  const itemClass = (id: string) =>
    cn(
      "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-colors",
      active === id ? "text-[#00f076]" : "text-slate-500 hover:text-slate-300"
    )

  return (
    <>
      <nav
        aria-label="Navigasi utama mobile"
        className="fixed right-0 bottom-0 left-0 z-50 border-t border-[#1c2225] bg-[#0b0f10]/90 backdrop-blur-md md:hidden"
      >
        <div className="grid grid-cols-5 items-end px-2 pt-1 pb-[env(safe-area-inset-bottom)]">
          <a href="#overview" className={itemClass("overview")}>
            <LayoutDashboard className="size-5" />
            <span>Dashboard</span>
          </a>
          <a href="#transaksi" className={itemClass("transaksi")}>
            <ReceiptText className="size-5" />
            <span>Riwayat</span>
          </a>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onAddClick}
              aria-label="Tambah Transaksi"
              className="flex size-14 -translate-y-4 items-center justify-center rounded-full bg-[#00f076] text-[#070a0b] shadow-glow-mint transition-transform active:scale-95"
            >
              <Plus className="size-7" strokeWidth={2.5} />
            </button>
          </div>
          <a href="#wishlist" className={itemClass("wishlist")}>
            <Target className="size-5" />
            <span>Wishlist</span>
          </a>
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-colors",
              profileOpen ? "text-[#00f076]" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <User className="size-5" />
            <span>Profil</span>
          </button>
        </div>
      </nav>
      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} user={user} />
    </>
  )
}
