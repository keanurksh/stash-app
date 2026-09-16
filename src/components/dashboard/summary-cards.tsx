"use client"

import { motion } from "framer-motion"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
} from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { formatIDR } from "@/lib/format"
import { cn } from "@/lib/utils"

interface SummaryCardsProps {
  income: number
  expense: number
  net: number
  incomeCount: number
  expenseCount: number
  loading: boolean
  periodKey: string
}

interface MetricCardProps {
  label: string
  value: number
  prefix?: string
  icon: React.ElementType
  iconClasses: string
  cardClasses?: string
  badge?: string
  badgeClasses?: string
  footerLeft: string
  footerRight: string
  footerRightClasses: string
  blurClasses: string
  valueClasses?: string
  labelClasses?: string
}

function MetricCard({
  label,
  value,
  prefix,
  icon: Icon,
  iconClasses,
  cardClasses,
  badge,
  badgeClasses,
  footerLeft,
  footerRight,
  footerRightClasses,
  blurClasses,
  valueClasses,
  labelClasses,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "glass-panel group relative overflow-hidden rounded-2xl p-5 transition-all duration-300",
        cardClasses
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -bottom-6 -right-6 size-28 rounded-full blur-2xl",
          blurClasses
        )}
      />
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl border",
            iconClasses
          )}
        >
          <Icon className="size-6" strokeWidth={2.2} />
        </div>
        <div>
          <p
            className={cn(
              "text-xs font-medium tracking-wider uppercase",
              labelClasses ?? "text-slate-400"
            )}
          >
            {label}
          </p>
          <div className="mt-1 flex min-w-0 items-baseline gap-2">
            <span
              className={cn(
                "truncate font-space text-2xl font-bold tabular-nums text-white sm:text-4xl",
                valueClasses
              )}
              title={formatIDR(value)}
            >
              {prefix}
              {formatIDR(value)}
            </span>
          </div>
        </div>
        {badge ? (
          <span
            className={cn(
              "ml-auto self-start rounded px-1.5 py-0.5 text-[10px] font-bold",
              badgeClasses
            )}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[#1c2225]/60 pt-3 text-xs">
        <span className="text-slate-400">{footerLeft}</span>
        <span className={cn("font-mono font-medium", footerRightClasses)}>
          {footerRight}
        </span>
      </div>
    </div>
  )
}

export function SummaryCards({
  income,
  expense,
  net,
  incomeCount,
  expenseCount,
  loading,
  periodKey,
}: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    )
  }

  const surplus = net >= 0
  const savingsRatio = income > 0 ? ((net / income) * 100).toFixed(1) : "0.0"

  return (
    <motion.div
      key={periodKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <MetricCard
        label="Total Pemasukan"
        value={income}
        icon={ArrowDownLeft}
        iconClasses="border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
        cardClasses="hover:border-[#00f076]/40"
        blurClasses="bg-emerald-500/10"
        footerLeft={`${incomeCount} transaksi pemasukan`}
        footerRight={`${income > 0 ? Math.round((income / (income + expense)) * 100) : 0}% dari total arus`}
        footerRightClasses="text-emerald-400"
      />
      <MetricCard
        label="Total Pengeluaran"
        value={expense}
        icon={ArrowUpRight}
        iconClasses="border-rose-500/30 bg-rose-500/15 text-rose-400"
        cardClasses="hover:border-rose-400/40"
        blurClasses="bg-rose-500/10"
        footerLeft={`${expenseCount} transaksi tercatat`}
        footerRight={`${income + expense > 0 ? Math.round((expense / (income + expense)) * 100) : 0}% dari total arus`}
        footerRightClasses="text-rose-400"
      />
      <MetricCard
        label="Net Cash Flow"
        value={net}
        prefix={surplus ? "+" : ""}
        icon={Scale}
        iconClasses="border-[#00f076]/50 bg-[#00f076]/20 text-[#00f076]"
        cardClasses="border border-[#00f076]/30 bg-gradient-to-b from-[rgba(0,240,118,0.08)] to-transparent shadow-glow-mint hover:border-[#00f076]"
        blurClasses="bg-[#00f076]/15"
        badge={surplus ? "SURPLUS" : "DEFISIT"}
        badgeClasses={
          surplus
            ? "bg-[#00f076] text-[#070a0b]"
            : "bg-rose-500 text-white"
        }
        valueClasses={surplus ? "text-[#00f076]" : "text-rose-400"}
        labelClasses="font-semibold text-[#00f076]"
        footerLeft="Rasio Tabungan"
        footerRight={`${savingsRatio}%`}
        footerRightClasses="text-[#00f076] font-bold"
      />
    </motion.div>
  )
}
