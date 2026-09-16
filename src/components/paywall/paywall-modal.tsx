"use client"

import { useEffect, useState } from "react"
import {
  Banknote,
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  QrCode,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

import {
  ResponsiveDialog,
  ResponsiveDialogDescription,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog"
import {
  MANUAL_PAYMENT,
  PRO_PRICING,
  buildWhatsAppUpgradeUrl,
} from "@/lib/entitlements"
import { createClient } from "@/lib/supabase/client"
import { formatIDR } from "@/lib/format"
import { cn } from "@/lib/utils"

interface PaywallModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature?: string
  /** Email user untuk diisi otomatis ke template pesan WhatsApp */
  userEmail?: string
}

const PRO_FEATURES = [
  "Unlimited OCR Scan",
  "Multi-Wallet (BCA, GoPay, OVO, dll)",
  "Unlimited Wishlist Target",
  "Export Data CSV/Excel",
]

export function PaywallModal({
  open,
  onOpenChange,
  feature,
  userEmail: userEmailProp,
}: PaywallModalProps) {
  const [billing, setBilling] = useState<"bulanan" | "tahunan">("tahunan")
  const [fetchedEmail, setFetchedEmail] = useState<string | null>(null)

  // Ambil email user dari sesi (fallback kalau prop tidak diberikan)
  useEffect(() => {
    if (!open || userEmailProp) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setFetchedEmail(data.user?.email ?? null)
    })
  }, [open, userEmailProp])

  const email = userEmailProp ?? fetchedEmail

  const price =
    billing === "tahunan" ? PRO_PRICING.yearly : PRO_PRICING.monthly

  const handleTriPay = () => {
    toast("Pembayaran otomatis sedang disiapkan", {
      description:
        "Gunakan konfirmasi via WhatsApp untuk aktivasi instan.",
      duration: 5000,
    })
  }

  const handleWhatsApp = () => {
    window.open(
      buildWhatsAppUpgradeUrl({
        userEmail: email ?? "(belum login, mohon cantumkan email)",
        plan: billing,
      }),
      "_blank",
      "noopener,noreferrer"
    )
  }

  const copyAccount = (number: string) => {
    navigator.clipboard
      .writeText(number)
      .then(() => toast.success(`Nomor ${number} disalin`))
      .catch(() => toast.error("Gagal menyalin nomor"))
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      desktopClassName="max-h-[90vh] w-full max-w-[calc(100%-2rem)] overflow-hidden overflow-y-auto rounded-3xl border border-[#00f076]/30 bg-[#101415] p-0 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] sm:max-w-md"
    >
        {/* Ambient mint glow */}
        <div className="pointer-events-none absolute -top-16 left-1/2 size-48 -translate-x-1/2 rounded-full bg-[#00f076]/15 blur-3xl" />

        <div className="relative space-y-5 p-6 sm:p-8">
          <div className="space-y-2 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl border border-[#00f076]/50 bg-[#00f076]/20 text-[#00f076] shadow-glow-mint">
              <Sparkles className="size-6" />
            </div>
            <ResponsiveDialogTitle className="font-space text-xl font-bold tracking-tight text-white">
              {feature ? `Buka ${feature} dengan Pro` : "Upgrade ke Stash Pro"}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription className="font-jakarta text-sm text-slate-400">
              {feature
                ? `Fitur ${feature} hanya tersedia di paket Pro.`
                : "Buka semua fitur premium Stash dan kelola keuangan tanpa batas."}
            </ResponsiveDialogDescription>
          </div>

          {/* Billing selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setBilling("bulanan")}
              aria-pressed={billing === "bulanan"}
              className={cn(
                "relative rounded-xl border p-4 text-center transition-all duration-150 active:scale-[0.98]",
                billing === "bulanan"
                  ? "border-[#00f076] bg-[#00f076]/10 shadow-glow-mint"
                  : "border-[#1c2225] bg-[#0b0f10] hover:border-[#3b4b3c]"
              )}
            >
              <p
                className={cn(
                  "text-[10px] font-bold tracking-[0.06em] uppercase",
                  billing === "bulanan" ? "text-[#00f076]" : "text-slate-400"
                )}
              >
                Bulanan
              </p>
              <p
                className={cn(
                  "mt-1 font-space text-lg font-bold",
                  billing === "bulanan" ? "text-[#00f076]" : "text-white"
                )}
              >
                {formatIDR(PRO_PRICING.monthly)}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">per bulan</p>
            </button>

            <button
              type="button"
              onClick={() => setBilling("tahunan")}
              aria-pressed={billing === "tahunan"}
              className={cn(
                "relative rounded-xl border p-4 text-center transition-all duration-150 active:scale-[0.98]",
                billing === "tahunan"
                  ? "border-[#00f076] bg-[#00f076]/10 shadow-glow-mint"
                  : "border-[#1c2225] bg-[#0b0f10] hover:border-[#3b4b3c]"
              )}
            >
              {billing === "tahunan" ? (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-[#00f076] px-2 py-0.5 text-[9px] font-bold tracking-wider text-[#070a0b] uppercase">
                  Hemat 35%
                </span>
              ) : null}
              <p
                className={cn(
                  "text-[10px] font-bold tracking-[0.06em] uppercase",
                  billing === "tahunan" ? "text-[#00f076]" : "text-slate-400"
                )}
              >
                Tahunan
              </p>
              <p
                className={cn(
                  "mt-1 font-space text-lg font-bold",
                  billing === "tahunan" ? "text-[#00f076]" : "text-white"
                )}
              >
                {formatIDR(PRO_PRICING.yearly)}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">per tahun</p>
            </button>
          </div>

          {/* Feature checklist */}
          <ul className="space-y-2.5 rounded-xl border border-[#1c2225] bg-[#0b0f10] p-4">
            {PRO_FEATURES.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 text-sm text-slate-200"
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#00f076]/15 text-[#00f076]">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>

          {/* Payment option 1: TriPay (Coming Soon) */}
          <button
            type="button"
            onClick={handleTriPay}
            className="relative flex w-full items-center gap-3 rounded-xl border border-[#1c2225] bg-[#0b0f10] p-4 text-left opacity-70 transition-colors hover:border-[#3b4b3c]"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#1c2225] bg-[#14191b] text-slate-300">
              <QrCode className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">
                Bayar Otomatis via QRIS / VA
              </p>
              <p className="text-[11px] text-slate-500">
                TriPay: QRIS, Virtual Account, e-wallet
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-400 uppercase">
              Coming Soon
            </span>
          </button>

          {/* Payment option 2: Manual transfer + WhatsApp (Active) */}
          <div className="rounded-xl border border-[#00f076]/30 bg-[#00f076]/5 p-4">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <Banknote className="size-4 text-[#00f076]" />
                Transfer Manual
              </p>
              <span className="rounded-full border border-[#00f076]/30 bg-[#00f076]/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#00f076] uppercase">
                Aktif
              </span>
            </div>

            <p className="mt-2 font-jakarta text-xs text-slate-400">
              Transfer {formatIDR(price)} ({billing}) ke salah satu rekening
              berikut:
            </p>

            <div className="mt-3 space-y-2">
              {MANUAL_PAYMENT.accounts.map((account) => (
                <button
                  key={`${account.bank}-${account.number}`}
                  type="button"
                  onClick={() => copyAccount(account.number)}
                  className="flex w-full items-center justify-between rounded-lg border border-[#1c2225] bg-[#0b0f10] px-3 py-2.5 text-left transition-colors hover:border-[#00f076]/40"
                >
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {account.bank} &bull;{" "}
                      <span className="font-mono">{account.number}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      a.n. {account.holder}
                    </p>
                  </div>
                  <Copy className="size-4 shrink-0 text-slate-400" />
                </button>
              ))}
              <p className="flex items-start gap-1.5 text-[11px] text-slate-500">
                <QrCode className="mt-0.5 size-3.5 shrink-0" />
                {MANUAL_PAYMENT.qrisNote}
              </p>
            </div>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00f076] px-4 py-3 text-sm font-bold text-[#070a0b] shadow-glow-mint transition hover:bg-[#00dc6c] active:scale-[0.99]"
            >
              <MessageCircle className="size-4" />
              Konfirmasi via WhatsApp
              <ExternalLink className="size-3.5 opacity-70" />
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-500">
              Kirim bukti transfer, admin aktivasi Pro kamu dalam hitungan
              menit.
            </p>
          </div>
        </div>
    </ResponsiveDialog>
  )
}
