"use client"

import { useState } from "react"
import { AlertTriangle, Loader2, Lock, PiggyBank, Plus } from "lucide-react"
import { toast } from "sonner"

import { PaywallModal } from "@/components/paywall/paywall-modal"
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
import { formatIDR } from "@/lib/format"
import { canCreateWithinFreeLimit, isPlanLimitError, usePlanStatus } from "@/lib/plan-gate"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { BudgetCap, Category, Transaction } from "@/types"

interface BudgetCapsSectionProps {
  caps: BudgetCap[]
  categories: Category[]
  transactions: Transaction[]
  monthYear: string
  userId: string
  onChanged: () => void
}

export function BudgetCapsSection({
  caps,
  categories,
  transactions,
  monthYear,
  userId,
  onChanged,
}: BudgetCapsSectionProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const { isPro } = usePlanStatus()

  const handleAddClick = () => {
    if (canCreateWithinFreeLimit(isPro, caps.length)) {
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
            Pos Anggaran
          </h2>
          <p className="text-xs text-slate-400">
            Batas pengeluaran per kategori bulan ini
          </p>
        </div>
        <span className="rounded-lg border border-[#1c2225] bg-[#14191b] px-2 py-1 font-mono text-xs text-slate-400">
          {caps.length} Pos
        </span>
      </div>

      {caps.length === 0 ? (
        <div className="glass-panel flex flex-col items-center gap-3 rounded-2xl border border-[#1c2225]/80 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-[#14191b]">
            <PiggyBank className="size-5 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              Belum ada pos anggaran
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Setel batas pengeluaran per kategori biar gak overspending.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddClick}
            className="mt-1 flex items-center gap-2 rounded-xl bg-[#00f076] px-4 py-2.5 text-sm font-bold text-[#070a0b] shadow-glow-mint transition hover:bg-[#00dc6c] active:scale-[0.99]"
          >
            {isPro ? <Plus className="size-4" /> : <Lock className="size-4" />}
            {isPro ? "Buat Pos Anggaran" : "Buat Pos Anggaran (1 Gratis)"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {caps.map((cap) => (
            <BudgetCapCard
              key={cap.id}
              cap={cap}
              categories={categories}
              transactions={transactions}
              monthYear={monthYear}
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
              {isPro ? "Pos Anggaran Baru" : "Pos Anggaran Baru (Pro)"}
            </p>
          </button>
        </div>
      )}

      <BudgetCapCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        categories={categories}
        monthYear={monthYear}
        userId={userId}
        onCreated={onChanged}
        onLimitHit={() => setPaywallOpen(true)}
      />
      <PaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="Pos Anggaran"
      />
    </section>
  )
}

function BudgetCapCard({
  cap,
  categories,
  transactions,
  monthYear,
}: {
  cap: BudgetCap
  categories: Category[]
  transactions: Transaction[]
  monthYear: string
}) {
  const category = categories.find((c) => c.id === cap.category_id)
  const spent = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.category_id === cap.category_id &&
        t.date.startsWith(monthYear)
    )
    .reduce((sum, t) => sum + t.amount, 0)

  const percent =
    cap.target_amount > 0 ? (spent / cap.target_amount) * 100 : 0
  const over = spent > cap.target_amount
  const warning = !over && percent >= 80

  return (
    <div
      className={cn(
        "glass-panel relative overflow-hidden rounded-2xl border p-5 transition-all duration-300",
        over
          ? "border-rose-500/40"
          : warning
            ? "border-amber-500/40"
            : "border-[#1c2225]/80 hover:border-[#00f076]/40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white" title={category?.name}>
            {category?.name ?? "Kategori"}
          </p>
          <p className="text-[11px] text-slate-500">Pos anggaran bulanan</p>
        </div>
        {over ? (
          <span className="flex shrink-0 items-center gap-1 rounded bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-bold text-rose-400">
            <AlertTriangle className="size-3" />
            Over
          </span>
        ) : warning ? (
          <span className="flex shrink-0 items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
            <AlertTriangle className="size-3" />
            Hampir
          </span>
        ) : (
          <span className="shrink-0 rounded bg-[#00f076]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#00f076]">
            {Math.round(percent)}%
          </span>
        )}
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#1c2225]/70">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            over
              ? "bg-rose-500"
              : warning
                ? "bg-amber-400"
                : "bg-gradient-to-r from-[#00b85a] to-[#00f076]"
          )}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          Terpakai:{" "}
          <b className={cn("font-mono", over ? "text-rose-400" : "text-white")}>
            {formatIDR(spent)}
          </b>
        </span>
        <span className="font-mono text-slate-400">
          / {formatIDR(cap.target_amount)}
        </span>
      </div>
      {over ? (
        <p className="mt-1.5 text-[11px] text-rose-400">
          Over {formatIDR(spent - cap.target_amount)} dari batas aman.
        </p>
      ) : null}
    </div>
  )
}

function BudgetCapCreateDialog({
  open,
  onOpenChange,
  categories,
  monthYear,
  userId,
  onCreated,
  onLimitHit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  monthYear: string
  userId: string
  onCreated: () => void
  onLimitHit: () => void
}) {
  const [categoryId, setCategoryId] = useState<string>("")
  const [targetAmount, setTargetAmount] = useState("")
  const [saving, setSaving] = useState(false)

  const expenseCategories = categories.filter((c) => c.type === "expense")

  const handleSave = async () => {
    const target = Number(targetAmount.replace(/\D/g, "")) || 0
    if (!categoryId) {
      toast.error("Pilih kategori dulu")
      return
    }
    if (target <= 0) {
      toast.error("Target nominal harus lebih dari 0")
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("budget_caps")
      .insert({
        user_id: userId,
        category_id: categoryId,
        target_amount: target,
        month_year: monthYear,
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
      toast.error("Gagal membuat pos anggaran", { description: error.message })
      return
    }

    void data
    toast.success("Pos anggaran dibuat")
    setCategoryId("")
    setTargetAmount("")
    onCreated()
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
            <PiggyBank className="size-5" />
          </div>
          <div>
            <DialogTitle className="font-space text-lg font-bold text-white">
              Pos Anggaran Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Batasi pengeluaran kategori bulan ini.
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
            <Label className="text-xs font-medium text-slate-300">Kategori</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className={cn(inputClass, "w-full")}>
                <SelectValue placeholder="Pilih kategori pengeluaran" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-300">
              Batas Pengeluaran
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

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00f076] px-4 py-3 text-sm font-bold text-[#070a0b] shadow-glow-mint transition hover:bg-[#00dc6c] active:scale-[0.99] disabled:opacity-70"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Buat Pos Anggaran
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
