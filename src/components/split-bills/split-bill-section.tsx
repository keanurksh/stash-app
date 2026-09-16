"use client"

import { useMemo, useState } from "react"
import { format, parseISO } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { Check, CircleCheck, Loader2, Lock, Plus, ReceiptText, Trash2, Users } from "lucide-react"
import { toast } from "sonner"

import { PaywallModal } from "@/components/paywall/paywall-modal"
import {
  ResponsiveDialog,
  ResponsiveDialogDescription,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatIDR } from "@/lib/format"
import { canCreateWithinFreeLimit, usePlanStatus } from "@/lib/plan-gate"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { SplitBill, SplitBillItem } from "@/types"

interface SplitBillSectionProps {
  bills: SplitBill[]
  items: SplitBillItem[]
  userId: string
  onChanged: () => void
}

interface DraftItem {
  friend_name: string
  amount: string
}

export function SplitBillSection({
  bills,
  items,
  userId,
  onChanged,
}: SplitBillSectionProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const { isPro } = usePlanStatus()

  const activeBills = bills.filter((b) => b.status === "active")

  const itemsByBill = useMemo(() => {
    const map = new Map<string, SplitBillItem[]>()
    for (const item of items) {
      const list = map.get(item.split_bill_id) ?? []
      list.push(item)
      map.set(item.split_bill_id, list)
    }
    return map
  }, [items])

  const handleAddClick = () => {
    if (canCreateWithinFreeLimit(isPro, activeBills.length)) {
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
            Split Bill
          </h2>
          <p className="text-xs text-slate-400">
            Bagi tagihan patungan dan lacak siapa yang belum bayar
          </p>
        </div>
        <span className="rounded-lg border border-[#1c2225] bg-[#14191b] px-2 py-1 font-mono text-xs text-slate-400">
          {activeBills.length} Aktif
        </span>
      </div>

      {bills.length === 0 ? (
        <div className="glass-panel flex flex-col items-center gap-3 rounded-2xl border border-[#1c2225]/80 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-[#14191b]">
            <Users className="size-5 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              Belum ada split bill
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Patungan makan, nongkrong, atau Gift? Catat di sini biar nggak
              ada yang lupa bayar.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddClick}
            className="mt-1 flex items-center gap-2 rounded-xl bg-[#00f076] px-4 py-2.5 text-sm font-bold text-[#070a0b] shadow-glow-mint transition hover:bg-[#00dc6c] active:scale-[0.99]"
          >
            {isPro ? <Plus className="size-4" /> : <Lock className="size-4" />}
            {isPro ? "Buat Split Bill" : "Buat Split Bill (1 Gratis)"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {bills.map((bill) => (
            <SplitBillCard
              key={bill.id}
              bill={bill}
              items={itemsByBill.get(bill.id) ?? []}
              userId={userId}
              onChanged={onChanged}
            />
          ))}
          <button
            type="button"
            onClick={handleAddClick}
            className="group flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#1c2225] p-4 transition-colors hover:border-[#00f076]/40"
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
              {isPro ? "Split Bill Baru" : "Split Bill Baru (Pro)"}
            </p>
          </button>
        </div>
      )}

      <SplitBillCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        userId={userId}
        onCreated={onChanged}
      />
      <PaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="Split Bill"
      />
    </section>
  )
}

function SplitBillCard({
  bill,
  items,
  userId,
  onChanged,
}: {
  bill: SplitBill
  items: SplitBillItem[]
  userId: string
  onChanged: () => void
}) {
  const paidCount = items.filter((i) => i.is_paid).length
  const totalPaid = items
    .filter((i) => i.is_paid)
    .reduce((s, i) => s + i.amount, 0)
  const percent =
    bill.total_amount > 0
      ? Math.min(100, (totalPaid / bill.total_amount) * 100)
      : 0

  const togglePaid = async (item: SplitBillItem) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("split_bill_items")
      .update({ is_paid: !item.is_paid, updated_at: new Date().toISOString() })
      .eq("id", item.id)
    if (error) {
      toast.error("Gagal memperbarui status")
      return
    }
    onChanged()
  }

  const completeBill = async () => {
    const supabase = createClient()
    const { error } = await supabase
      .from("split_bills")
      .update({ status: "completed" })
      .eq("id", bill.id)
    if (error) {
      toast.error("Gagal menyelesaikan split bill")
      return
    }
    toast.success("Split bill selesai")
    onChanged()
  }

  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl border border-[#1c2225]/80 p-5 transition-all duration-300 hover:border-[#00f076]/40">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg border border-[#00f076]/20 bg-[#00f076]/10 text-[#00f076]">
            <ReceiptText className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white" title={bill.title}>
              {bill.title}
            </p>
            <p className="text-[11px] text-slate-500">
              {format(parseISO(bill.created_at), "d MMM yyyy", { locale: localeID })}
            </p>
          </div>
        </div>
        {bill.status === "completed" ? (
          <span className="shrink-0 rounded bg-[#1c2225] px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
            SELESAI
          </span>
        ) : (
          <span className="shrink-0 rounded bg-[#00f076]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#00f076]">
            {paidCount}/{items.length} Lunas
          </span>
        )}
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#1c2225]/70">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#00b85a] to-[#00f076] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          Terbayar:{" "}
          <b className="font-mono text-white">{formatIDR(totalPaid)}</b>
        </span>
        <span className="font-mono text-slate-400">
          Total: {formatIDR(bill.total_amount)}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="mt-3 space-y-1 border-t border-[#1c2225]/40 pt-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-1 text-xs"
            >
              <button
                type="button"
                onClick={() => togglePaid(item)}
                className="flex items-center gap-2 text-left"
              >
                <CircleCheck
                  className={cn(
                    "size-4 transition-colors",
                    item.is_paid
                      ? "text-[#00f076]"
                      : "text-slate-600 hover:text-slate-400"
                  )}
                />
                <span
                  className={cn(
                    item.is_paid
                      ? "text-slate-500 line-through"
                      : "font-medium text-slate-200"
                  )}
                >
                  {item.friend_name}
                  {item.item_description ? (
                    <span className="text-slate-500"> ({item.item_description})</span>
                  ) : null}
                </span>
              </button>
              <span
                className={cn(
                  "font-mono",
                  item.is_paid ? "font-semibold text-[#00f076]" : "text-amber-400"
                )}
              >
                {formatIDR(item.amount)}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {bill.status === "active" ? (
        <button
          type="button"
          onClick={completeBill}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#1c2225] py-2 text-xs font-medium text-slate-300 transition hover:border-[#00f076]/40 hover:text-white"
        >
          <Check className="size-3.5" />
          Tandai Selesai
        </button>
      ) : null}
      <span className="sr-only">{userId}</span>
    </div>
  )
}

function SplitBillCreateDialog({
  open,
  onOpenChange,
  userId,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onCreated: () => void
}) {
  const [title, setTitle] = useState("")
  const [total, setTotal] = useState("")
  const [draftItems, setDraftItems] = useState<DraftItem[]>([
    { friend_name: "", amount: "" },
  ])
  const [saving, setSaving] = useState(false)

  const totalValue = Number(total.replace(/\D/g, "")) || 0

  const setItem = (index: number, patch: Partial<DraftItem>) => {
    setDraftItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    )
  }

  const splitEvenly = () => {
    if (draftItems.length === 0 || totalValue <= 0) return
    const per = Math.floor(totalValue / draftItems.length)
    setDraftItems((prev) =>
      prev.map((item) => ({ ...item, amount: String(per) }))
    )
  }

  const handleSave = async () => {
    const validItems = draftItems.filter(
      (item) => item.friend_name.trim() && Number(item.amount.replace(/\D/g, "")) > 0
    )
    if (!title.trim() || totalValue <= 0) {
      toast.error("Judul dan total tagihan wajib diisi")
      return
    }
    if (validItems.length === 0) {
      toast.error("Tambahkan minimal 1 teman dengan nominal")
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { data: bill, error: billError } = await supabase
      .from("split_bills")
      .insert({
        user_id: userId,
        title: title.trim(),
        total_amount: totalValue,
      })
      .select()
      .single()

    if (billError || !bill) {
      setSaving(false)
      toast.error("Gagal membuat split bill", {
        description: billError?.message,
      })
      return
    }

    const { error: itemsError } = await supabase.from("split_bill_items").insert(
      validItems.map((item) => ({
        split_bill_id: bill.id,
        friend_name: item.friend_name.trim(),
        amount: Number(item.amount.replace(/\D/g, "")),
        item_description: null,
      }))
    )
    setSaving(false)

    if (itemsError) {
      // Rollback bill agar tidak yatim
      await supabase.from("split_bills").delete().eq("id", bill.id)
      toast.error("Gagal menyimpan daftar teman", {
        description: itemsError.message,
      })
      return
    }

    toast.success("Split bill dibuat")
    setTitle("")
    setTotal("")
    setDraftItems([{ friend_name: "", amount: "" }])
    onCreated()
    onOpenChange(false)
  }

  const inputClass =
    "rounded-xl border border-[#1c2225] bg-[#0b0f10] text-slate-200 transition focus:border-[#00f076] focus:ring-1 focus:ring-[#00f076] focus:outline-none"

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      desktopClassName="max-h-[90vh] w-full max-w-[calc(100%-2rem)] overflow-hidden rounded-3xl border border-[#1c2225] bg-[#101415] p-0 sm:max-w-md"
    >
      <div className="flex items-center gap-3 border-b border-[#1c2225]/80 px-6 pt-6 pb-4">
        <div className="flex size-10 items-center justify-center rounded-xl border border-[#00f076]/30 bg-[#00f076]/10 text-[#00f076]">
          <Users className="size-5" />
        </div>
        <div>
          <ResponsiveDialogTitle className="font-space text-lg font-bold text-white">
            Split Bill Baru
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-xs text-slate-400">
            Catat patungan dan bagi ke tiap teman.
          </ResponsiveDialogDescription>
        </div>
      </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-300">Judul</Label>
            <Input
              placeholder="Contoh: Nongkrong Sushi Hiro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-300">
              Total Tagihan
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-[#00f076]">
                Rp
              </span>
              <Input
                inputMode="numeric"
                placeholder="0"
                value={total}
                onChange={(e) => setTotal(e.target.value.replace(/[^\d]/g, ""))}
                className={cn(inputClass, "pl-11 font-mono")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-slate-300">
                Daftar Teman
              </Label>
              <button
                type="button"
                onClick={splitEvenly}
                className="text-[11px] font-medium text-[#00f076] hover:underline"
              >
                Bagi Rata
              </button>
            </div>
            {draftItems.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={index === 0 ? "Nama teman 1" : `Teman ${index + 1}`}
                  value={item.friend_name}
                  onChange={(e) => setItem(index, { friend_name: e.target.value })}
                  className={cn(inputClass, "flex-1")}
                />
                <Input
                  inputMode="numeric"
                  placeholder="0"
                  value={item.amount}
                  onChange={(e) =>
                    setItem(index, {
                      amount: e.target.value.replace(/[^\d]/g, ""),
                    })
                  }
                  className={cn(inputClass, "w-28 font-mono")}
                />
                {draftItems.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setDraftItems((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="rounded-lg px-2 text-slate-500 transition hover:text-rose-400"
                    aria-label="Hapus baris"
                  >
                    <Trash2 className="size-4" />
                  </button>
                ) : null}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setDraftItems((prev) => [...prev, { friend_name: "", amount: "" }])
              }
              className="flex items-center gap-1.5 text-xs font-medium text-[#00f076] hover:underline"
            >
              <Plus className="size-3.5" />
              Tambah Teman
            </button>
          </div>
        </div>

        <div className="border-t border-[#1c2225]/80 p-6 pt-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00f076] px-4 py-3 text-sm font-bold text-[#070a0b] shadow-glow-mint transition hover:bg-[#00dc6c] active:scale-[0.99] disabled:opacity-70"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Buat Split Bill
          </button>
        </div>
    </ResponsiveDialog>
  )
}
