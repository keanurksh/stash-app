"use client"

import { useState } from "react"
import { Loader2, Wallet as WalletIcon } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isPlanLimitError } from "@/lib/plan-gate"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { Wallet, WalletType } from "@/types"

interface WalletCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onCreated: (wallet: Wallet) => void
  /** Dipanggil saat limit free plan tercapai — parent menampilkan PaywallModal */
  onLimitHit: () => void
}

const WALLET_TYPES: { value: WalletType; label: string }[] = [
  { value: "ewallet", label: "E-Wallet (GoPay, OVO, DANA...)" },
  { value: "bank", label: "Bank (BCA, Mandiri, Jenius...)" },
  { value: "cash", label: "Tunai" },
]

export function WalletCreateDialog({
  open,
  onOpenChange,
  userId,
  onCreated,
  onLimitHit,
}: WalletCreateDialogProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<WalletType>("ewallet")
  const [balance, setBalance] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Nama dompet wajib diisi")
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("wallets")
      .insert({
        user_id: userId,
        name: name.trim(),
        type,
        balance: Number(balance.replace(/\D/g, "")) || 0,
      })
      .select()
      .single()
    setSaving(false)

    if (error) {
      if (isPlanLimitError(error)) {
        onOpenChange(false)
        onLimitHit()
        return
      }
      toast.error("Gagal membuat dompet", { description: error.message })
      return
    }

    toast.success("Dompet berhasil dibuat")
    setName("")
    setBalance("")
    onCreated(data as Wallet)
    onOpenChange(false)
  }

  const inputClass =
    "rounded-xl border border-[#1c2225] bg-[#0b0f10] text-slate-200 transition focus:border-[#00f076] focus:ring-1 focus:ring-[#00f076] focus:outline-none"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[calc(100%-2rem)] rounded-3xl border border-[#1c2225] bg-[#101415] p-0 sm:max-w-md"
      >
        <div className="flex items-center gap-3 border-b border-[#1c2225]/80 px-6 pt-6 pb-4">
          <div className="flex size-10 items-center justify-center rounded-xl border border-[#00f076]/30 bg-[#00f076]/10 text-[#00f076]">
            <WalletIcon className="size-5" />
          </div>
          <div>
            <DialogTitle className="font-space text-lg font-bold text-white">
              Tambah Dompet
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Pisahkan aliran dana per akun: e-wallet, bank, atau tunai.
            </DialogDescription>
          </div>
        </div>

        <form
          className="space-y-4 p-6"
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
        >
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-300">
              Nama Dompet
            </Label>
            <Input
              placeholder="Contoh: GoPay Utama, BCA Tabungan..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-300">Tipe</Label>
            <Select value={type} onValueChange={(v) => setType(v as WalletType)}>
              <SelectTrigger className={cn(inputClass, "w-full")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WALLET_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-300">
              Saldo Awal (opsional)
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-[#00f076]">
                Rp
              </span>
              <Input
                inputMode="numeric"
                placeholder="0"
                value={balance}
                onChange={(e) =>
                  setBalance(e.target.value.replace(/[^\d]/g, ""))
                }
                className={cn(inputClass, "pl-11 font-mono")}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00f076] px-4 py-3 text-sm font-bold text-[#070a0b] shadow-glow-mint transition hover:bg-[#00dc6c] active:scale-[0.99] disabled:opacity-70"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Buat Dompet
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
