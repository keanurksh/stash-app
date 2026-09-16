"use client"

import { useState } from "react"
import { Banknote, Lock, Plus, Smartphone, Wallet as WalletIcon } from "lucide-react"

import { PaywallModal } from "@/components/paywall/paywall-modal"
import { WalletCreateDialog } from "@/components/wallets/wallet-create-dialog"
import { formatIDR } from "@/lib/format"
import { canCreateWithinFreeLimit, usePlanStatus } from "@/lib/plan-gate"
import { cn } from "@/lib/utils"
import type { Wallet } from "@/types"

interface WalletsStripProps {
  wallets: Wallet[]
  userId: string
  onWalletsChanged: () => void
}

const TYPE_ICONS = {
  bank: Banknote,
  ewallet: Smartphone,
  cash: WalletIcon,
} as const

const TYPE_LABELS = {
  bank: "Bank",
  ewallet: "E-Wallet",
  cash: "Tunai",
} as const

export function WalletsStrip({
  wallets,
  userId,
  onWalletsChanged,
}: WalletsStripProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const { isPro } = usePlanStatus()

  const handleAddClick = () => {
    if (canCreateWithinFreeLimit(isPro, wallets.length)) {
      setCreateOpen(true)
    } else {
      setPaywallOpen(true)
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-space text-lg font-bold tracking-tight text-white">
            Dompet
          </h2>
          <p className="text-xs text-slate-400">
            Pilih sumber dana untuk setiap transaksi
          </p>
        </div>
        <span className="rounded-lg border border-[#1c2225] bg-[#14191b] px-2 py-1 font-mono text-xs text-slate-400">
          {wallets.length} Dompet
        </span>
      </div>

      {wallets.length === 0 ? (
        <div className="glass-panel flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#1c2225] px-4 py-8 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-[#14191b]">
            <WalletIcon className="size-5 text-slate-500" />
          </div>
          <p className="text-sm font-medium text-white">
            Belum ada dompet tersimpan
          </p>
          <p className="max-w-[260px] text-xs text-slate-400">
            Buat dompet pertamamu untuk mengelompokkan transaksi per akun
            bank atau e-wallet.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {wallets.map((wallet) => {
          const Icon = TYPE_ICONS[wallet.type] ?? WalletIcon
          return (
            <div
              key={wallet.id}
              className="glass-panel group relative overflow-hidden rounded-2xl border border-[#1c2225]/80 p-4 transition-all duration-300 hover:border-[#00f076]/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg border border-[#00f076]/20 bg-[#00f076]/10 text-[#00f076]">
                  <Icon className="size-4" />
                </div>
                {wallet.is_default ? (
                  <span className="rounded bg-[#1c2225] px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-slate-300 uppercase">
                    Utama
                  </span>
                ) : null}
              </div>
              <p className="mt-3 truncate text-sm font-medium text-white" title={wallet.name}>
                {wallet.name}
              </p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-[#00f076]">
                {formatIDR(wallet.balance)}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                {TYPE_LABELS[wallet.type]}
              </p>
            </div>
          )
        })}

        {/* Add wallet card */}
        <button
          type="button"
          onClick={handleAddClick}
          className="group flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#1c2225] bg-transparent p-4 transition-colors hover:border-[#00f076]/40"
        >
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-lg border transition-colors",
              isPro
                ? "border-[#00f076]/20 bg-[#00f076]/10 text-[#00f076]"
                : "border-[#1c2225] bg-[#14191b] text-slate-400 group-hover:border-[#00f076]/40 group-hover:text-[#00f076]"
            )}
          >
            {isPro ? <Plus className="size-4" /> : <Lock className="size-4" />}
          </div>
          <p className="text-xs font-medium text-slate-400 group-hover:text-white">
            {isPro ? "Tambah Dompet" : "Tambah Dompet (Pro)"}
          </p>
        </button>
      </div>

      <WalletCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        userId={userId}
        onCreated={onWalletsChanged}
        onLimitHit={() => setPaywallOpen(true)}
      />
      <PaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="Multi-Wallet"
      />
    </section>
  )
}
