"use client"

import { Lock, Sparkles, TrendingUp, Flame, ReceiptText } from "lucide-react"
import { useState } from "react"

import { PaywallModal } from "@/components/paywall/paywall-modal"
import { formatIDR } from "@/lib/format"
import type { Category, Transaction } from "@/types"

interface SmartInsightProps {
  transactions: Transaction[]
  categories: Category[]
  streak: number
  savingLevel: string
  isPro: boolean
  monthLabel: string
}

interface Insight {
  icon: React.ElementType
  title: string
  body: string
}

export function SmartInsight({
  transactions,
  categories,
  streak,
  savingLevel,
  isPro,
  monthLabel,
}: SmartInsightProps) {
  const paywallOpenState = useState(false)
  const [paywallOpen, setPaywallOpen] = paywallOpenState

  const expenses = transactions.filter((t) => t.type === "expense")

  // Insight 1: rata-rata harian + proyeksi akhir bulan
  const now = new Date()
  const dayOfMonth = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const monthExpense = expenses.reduce((s, t) => s + t.amount, 0)
  const dailyAvg = dayOfMonth > 0 ? monthExpense / dayOfMonth : 0
  const projection = dailyAvg * daysInMonth

  // Insight 2: kategori terbesar
  const byCategory = new Map<string, number>()
  for (const t of expenses) {
    const name =
      (t.category_id ? categories.find((c) => c.id === t.category_id)?.name : null) ??
      "Tanpa Kategori"
    byCategory.set(name, (byCategory.get(name) ?? 0) + t.amount)
  }
  const topCategory = Array.from(byCategory.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0]

  // Insight 3: transaksi terbesar bulan ini
  const largest = expenses.sort((a, b) => b.amount - a.amount)[0]

  const insights: Insight[] = [
    {
      icon: TrendingUp,
      title: "Proyeksi Pengeluaran",
      body: `Rata-rata harianmu ${formatIDR(Math.round(dailyAvg))}. Kalau pola ini lanjut, total ${monthLabel} sekitar ${formatIDR(Math.round(projection))}.`,
    },
    topCategory
      ? {
          icon: ReceiptText,
          title: "Kategori Dominan",
          body: `"${topCategory[0]}" menyumbang ${formatIDR(topCategory[1])} bulan ini. Pangkas dikit di sini paling ngefek.`,
        }
      : {
          icon: ReceiptText,
          title: "Kategori Dominan",
          body: "Belum ada pengeluaran bulan ini. Pertahankan!",
        },
    largest
      ? {
          icon: Sparkles,
          title: "Transaksi Terbesar",
          body: `${formatIDR(largest.amount)}${largest.notes ? ` (${largest.notes})` : ""} jadi pengeluaran terbesar ${monthLabel}.`,
        }
      : {
          icon: Sparkles,
          title: "Transaksi Terbesar",
          body: `Catat transaksi untuk melihat insight otomatis.`,
        },
  ]

  const visibleInsights = isPro ? insights : insights.slice(0, 1)
  const lockedCount = insights.length - visibleInsights.length

  const tierIcon =
    streak >= 30 ? "💎" : streak >= 14 ? "🥇" : streak >= 7 ? "🥈" : "🥉"

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-space text-lg font-bold tracking-tight text-white">
            Smart Insight
          </h2>
          <p className="text-xs text-slate-400">
            Analisis otomatis dari transaksi kamu
          </p>
        </div>
        <span className="rounded-lg border border-[#1c2225] bg-[#14191b] px-2 py-1 font-mono text-xs text-slate-400">
          Real-Time
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Streak card */}
        <div className="glass-panel relative overflow-hidden rounded-2xl border border-[#00f076]/30 bg-gradient-to-br from-[#101415] to-[#00f076]/5 p-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-space text-xs font-bold text-[#00f076]">
              <Flame className="size-4" />
              Streak {streak} Hari
            </span>
            <span className="text-[11px] text-slate-400">
              {tierIcon} {savingLevel}
            </span>
          </div>
          <p className="mt-2 font-jakarta text-sm text-slate-300">
            {streak <= 1
              ? "Catat transaksi tiap hari buat nge-charge streak."
              : streak < 7
                ? `Lanjut ${7 - streak} hari lagi buat naik ke Silver Saver.`
                : streak < 14
                  ? `Lanjut ${14 - streak} hari lagi buat naik ke Gold Saver.`
                  : streak < 30
                    ? `Lanjut ${30 - streak} hari lagi buat jadi Diamond Saver.`
                    : "Kamu di tier tertinggi. Absolutely killing it."}
          </p>
        </div>

        {/* Insight cards */}
        {visibleInsights.map((insight) => (
          <div
            key={insight.title}
            className="glass-panel rounded-2xl border border-[#1c2225]/80 p-5 transition-all duration-300 hover:border-[#00f076]/40"
          >
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg border border-[#00f076]/20 bg-[#00f076]/10 text-[#00f076]">
                <insight.icon className="size-4" />
              </div>
              <p className="font-space text-sm font-semibold text-white">
                {insight.title}
              </p>
            </div>
            <p className="mt-2.5 font-jakarta text-xs leading-relaxed text-slate-300">
              {insight.body}
            </p>
          </div>
        ))}

        {/* Locked insights for free users */}
        {lockedCount > 0 ? (
          <button
            type="button"
            onClick={() => setPaywallOpen(true)}
            className="group relative flex min-h-[120px] flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-[#1c2225] p-5 transition-colors hover:border-[#00f076]/40"
          >
            <div className="flex size-9 items-center justify-center rounded-lg border border-[#1c2225] bg-[#14191b] text-slate-400 group-hover:border-[#00f076]/40 group-hover:text-[#00f076]">
              <Lock className="size-4" />
            </div>
            <p className="text-xs font-medium text-slate-400 group-hover:text-white">
              {lockedCount} Insight Lainnya
            </p>
            <p className="font-jakarta text-[11px] text-slate-500">
              Buka dengan Stash Pro
            </p>
          </button>
        ) : null}
      </div>

      <PaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="Smart Insight"
      />
    </section>
  )
}
