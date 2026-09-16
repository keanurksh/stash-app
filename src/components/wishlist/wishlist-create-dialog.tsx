"use client"

import { useState } from "react"
import { Loader2, Target } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isPlanLimitError } from "@/lib/plan-gate"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { Wishlist } from "@/types"

interface WishlistCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onCreated: (wishlist: Wishlist) => void
  /** Dipanggil saat limit free plan tercapai — parent menampilkan PaywallModal */
  onLimitHit: () => void
}

export function WishlistCreateDialog({
  open,
  onOpenChange,
  userId,
  onCreated,
  onLimitHit,
}: WishlistCreateDialogProps) {
  const [name, setName] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [deadline, setDeadline] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const target = Number(targetAmount.replace(/\D/g, "")) || 0
    if (!name.trim()) {
      toast.error("Nama wishlist wajib diisi")
      return
    }
    if (target <= 0) {
      toast.error("Target nominal harus lebih dari 0")
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("wishlists")
      .insert({
        user_id: userId,
        name: name.trim(),
        target_amount: target,
        deadline: deadline || null,
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
      toast.error("Gagal membuat wishlist", { description: error.message })
      return
    }

    toast.success("Wishlist berhasil dibuat")
    setName("")
    setTargetAmount("")
    setDeadline("")
    onCreated(data as Wishlist)
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
            <Target className="size-5" />
          </div>
          <div>
            <DialogTitle className="font-space text-lg font-bold text-white">
              Wishlist Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Tetapkan target tabungan dan pantau progresnya.
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
              Nama Target
            </Label>
            <Input
              placeholder="Contoh: Konser, Laptop Baru, Liburan..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-300">
              Target Nominal
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-[#00f076]">
                Rp
              </span>
              <Input
                inputMode="numeric"
                placeholder="0"
                value={targetAmount}
                onChange={(e) =>
                  setTargetAmount(e.target.value.replace(/[^\d]/g, ""))
                }
                className={cn(inputClass, "pl-11 font-mono")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="wishlist-deadline"
              className="text-xs font-medium text-slate-300"
            >
              Target Tanggal (opsional)
            </Label>
            <Input
              id="wishlist-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00f076] px-4 py-3 text-sm font-bold text-[#070a0b] shadow-glow-mint transition hover:bg-[#00dc6c] active:scale-[0.99] disabled:opacity-70"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Buat Wishlist
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
