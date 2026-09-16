"use client"

import { useState } from "react"
import { LogOut, Plus, Sparkles, Wallet } from "lucide-react"
import { toast } from "sonner"

import { PaywallModal } from "@/components/paywall/paywall-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePlanStatus } from "@/lib/plan-gate"
import { getInitials } from "@/lib/format"
import { createClient } from "@/lib/supabase/client"
import type { DashboardUser } from "@/types"

interface DashboardHeaderProps {
  user: DashboardUser
  onAddClick: () => void
}

export function DashboardHeader({ user, onAddClick }: DashboardHeaderProps) {
  const [paywallOpen, setPaywallOpen] = useState(false)
  const { isPro, loading: planLoading } = usePlanStatus()

  const handleSignOut = async () => {
    const supabase = createClient()
    // Wipe local data immediately so nothing lingers in memory/DX after logout
    await supabase.auth.signOut()
    toast.success("Berhasil keluar")
    // Hard navigation: guarantees dashboard data is dropped from view instantly
    window.location.replace("/")
  }

  return (
    <header className="sticky top-0 z-40 hidden border-b border-[#1c2225]/80 bg-[#0b0f10]/90 backdrop-blur-md md:block">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#00b85a] to-[#00f076] text-[#070a0b] shadow-glow-mint">
            <Wallet className="size-6" strokeWidth={2.2} />
          </div>
          <span className="font-space text-xl font-bold tracking-tight text-white">
            Stash
          </span>
          {planLoading ? (
            <span className="h-5 w-12 animate-pulse rounded-full bg-[#1c2225]" />
          ) : isPro ? (
            <span className="rounded-full border border-[#00f076]/30 bg-[#00f076]/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#00f076]">
              PRO
            </span>
          ) : (
            <span className="rounded-full border border-slate-600 bg-slate-700/40 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-300">
              FREE
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!planLoading && !isPro ? (
            <button
              type="button"
              onClick={() => setPaywallOpen(true)}
              className="hidden items-center gap-1.5 rounded-xl border border-[#00f076]/40 bg-[#00f076]/10 px-3.5 py-2.5 text-sm font-semibold text-[#00f076] transition-all duration-200 hover:bg-[#00f076]/20 active:scale-[0.98] sm:inline-flex"
            >
              <Sparkles className="size-4" />
              Upgrade
            </button>
          ) : null}
          <button
            onClick={onAddClick}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-[#00f076] px-4 py-2.5 text-sm font-semibold text-[#070a0b] shadow-glow-mint transition-all duration-200 hover:bg-[#00dc6c] active:scale-[0.98]"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">Tambah Transaksi</span>
            <span className="sm:hidden">Tambah</span>
          </button>

          <div className="flex items-center gap-3 border-l border-[#1c2225] pl-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="group relative cursor-pointer">
                  <div className="size-9 overflow-hidden rounded-full bg-[#1c2225] p-0.5 ring-2 ring-[#00f076]/40 transition group-hover:ring-[#00f076]">
                    <Avatar className="size-full rounded-full">
                      {user.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                      ) : null}
                      <AvatarFallback className="rounded-full bg-[#1c2225] text-xs font-semibold text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[#00f076] ring-2 ring-[#0b0f10]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </p>
                  <div className="mt-2">
                    {planLoading ? (
                      <span className="inline-block h-5 w-14 animate-pulse rounded-full bg-[#1c2225]" />
                    ) : isPro ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#00f076]/30 bg-[#00f076]/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#00f076]">
                        <Sparkles className="size-3" />
                        PRO PLAN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-600 bg-slate-700/40 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-300">
                        FREE PLAN
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                {!isPro && !planLoading ? (
                  <>
                    <DropdownMenuSeparator />
                    <div className="p-1">
                      <button
                        type="button"
                        onClick={() => setPaywallOpen(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00f076] px-3 py-2 text-xs font-bold text-[#070a0b] shadow-glow-mint transition hover:bg-[#00dc6c] active:scale-[0.98]"
                      >
                        <Sparkles className="size-3.5" />
                        Upgrade to Pro
                      </button>
                    </div>
                  </>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOut className="size-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </header>
  )
}
