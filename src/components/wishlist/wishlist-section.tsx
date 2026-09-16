"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { Lock, Plus, Target } from "lucide-react"

import { PaywallModal } from "@/components/paywall/paywall-modal"
import { WishlistCreateDialog } from "@/components/wishlist/wishlist-create-dialog"
import { formatIDR } from "@/lib/format"
import { canCreateWithinFreeLimit, usePlanStatus } from "@/lib/plan-gate"
import type { Wishlist } from "@/types"

interface WishlistSectionProps {
  wishlists: Wishlist[]
  userId: string
  onWishlistsChanged: () => void
  sectionId?: string
}

export function WishlistSection({
  wishlists,
  userId,
  onWishlistsChanged,
  sectionId,
}: WishlistSectionProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const { isPro } = usePlanStatus()

  const active = wishlists.filter((w) => w.status === "active")

  const handleAddClick = () => {
    if (canCreateWithinFreeLimit(isPro, active.length)) {
      setCreateOpen(true)
    } else {
      setPaywallOpen(true)
    }
  }

  return (
    <section id={sectionId} className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-space text-lg font-bold tracking-tight text-white">
            Wishlist &amp; Target
          </h2>
          <p className="text-xs text-slate-400">
            Pantau progres tabungan menuju target kamu
          </p>
        </div>
        <span className="rounded-lg border border-[#1c2225] bg-[#14191b] px-2 py-1 font-mono text-xs text-slate-400">
          {active.length} Aktif
        </span>
      </div>

      {active.length === 0 && wishlists.length === 0 ? (
        <div className="glass-panel flex flex-col items-center gap-3 rounded-2xl border border-[#1c2225]/80 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-[#14191b]">
            <Target className="size-5 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              Belum ada target tabungan
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Bikin wishlist pertamamu biar nabung lebih terarah.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddClick}
            className="mt-1 flex items-center gap-2 rounded-xl bg-[#00f076] px-4 py-2.5 text-sm font-bold text-[#070a0b] shadow-glow-mint transition hover:bg-[#00dc6c] active:scale-[0.99]"
          >
            {isPro ? <Plus className="size-4" /> : <Lock className="size-4" />}
            {isPro ? "Buat Wishlist" : "Buat Wishlist (1 Gratis)"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((wishlist) => {
            const percent =
              wishlist.target_amount > 0
                ? Math.min(
                    100,
                    (wishlist.current_amount / wishlist.target_amount) * 100
                  )
                : 0
            return (
              <div
                key={wishlist.id}
                className="glass-panel relative overflow-hidden rounded-2xl border border-[#1c2225]/80 p-5 transition-all duration-300 hover:border-[#00f076]/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-lg border border-[#00f076]/20 bg-[#00f076]/10 text-[#00f076]">
                      <Target className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="truncate text-sm font-medium text-white"
                        title={wishlist.name}
                      >
                        {wishlist.name}
                      </p>
                      {wishlist.deadline ? (
                        <p className="text-[11px] text-slate-500">
                          Target:{" "}
                          {format(parseISO(wishlist.deadline), "d MMM yyyy", {
                            locale: localeID,
                          })}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <span
                    className={
                      percent >= 100
                        ? "shrink-0 rounded bg-[#00f076] px-1.5 py-0.5 text-[10px] font-bold text-[#070a0b]"
                        : "shrink-0 rounded bg-[#1c2225] px-1.5 py-0.5 text-[10px] font-bold text-slate-300"
                    }
                  >
                    {percent >= 100 ? "TERCAPAI" : `${Math.round(percent)}%`}
                  </span>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#1c2225]/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00b85a] to-[#00f076] transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Terkumpul:{" "}
                    <b className="font-mono text-white">
                      {formatIDR(wishlist.current_amount)}
                    </b>
                  </span>
                  <span className="font-mono text-slate-400">
                    / {formatIDR(wishlist.target_amount)}
                  </span>
                </div>
              </div>
            )
          })}

          {/* Add wishlist card */}
          <button
            type="button"
            onClick={handleAddClick}
            className="group flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#1c2225] p-4 transition-colors hover:border-[#00f076]/40"
          >
            <div
              className={
                isPro
                  ? "flex size-9 items-center justify-center rounded-lg border border-[#00f076]/20 bg-[#00f076]/10 text-[#00f076]"
                  : "flex size-9 items-center justify-center rounded-lg border border-[#1c2225] bg-[#14191b] text-slate-400 group-hover:border-[#00f076]/40 group-hover:text-[#00f076]"
              }
            >
              {isPro ? <Plus className="size-4" /> : <Lock className="size-4" />}
            </div>
            <p className="text-xs font-medium text-slate-400 group-hover:text-white">
              {isPro ? "Wishlist Baru" : "Wishlist Baru (Pro)"}
            </p>
          </button>
        </div>
      )}

      <WishlistCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        userId={userId}
        onCreated={onWishlistsChanged}
        onLimitHit={() => setPaywallOpen(true)}
      />
      <PaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="Unlimited Wishlist"
      />
    </section>
  )
}
