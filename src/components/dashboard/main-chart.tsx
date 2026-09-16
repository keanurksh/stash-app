"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartBar } from "lucide-react"

import { formatIDR, formatCompactIDR } from "@/lib/format"
import { Skeleton } from "@/components/ui/skeleton"

import {
  CurrencyTooltip,
  EXPENSE_COLOR,
  INCOME_COLOR,
  axisTickStyle,
} from "@/components/dashboard/chart-utils"

export interface ChartDatum {
  label: string
  income: number
  expense: number
}

interface MainChartProps {
  data: ChartDatum[]
  viewMode: "month" | "year"
  loading: boolean
  hasData: boolean
  periodLabel: string
}

export function MainChart({
  data,
  viewMode,
  loading,
  hasData,
  periodLabel,
}: MainChartProps) {
  const title =
    viewMode === "month"
      ? "Pemasukan vs Pengeluaran Harian"
      : "Pemasukan vs Pengeluaran Bulanan"
  const subtitle =
    viewMode === "month"
      ? `Tren arus kas harian ${periodLabel}`
      : `Tren arus kas bulanan sepanjang ${periodLabel}`

  const totalExpense = data.reduce((sum, d) => sum + d.expense, 0)
  const avgExpense = data.length > 0 ? totalExpense / data.length : 0
  const avgLabel =
    viewMode === "month"
      ? "Rata-rata pengeluaran harian"
      : "Rata-rata pengeluaran bulanan"

  return (
    <div className="glass-panel flex flex-col justify-between rounded-2xl border border-[#1c2225]/80 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-space text-base font-semibold text-white">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
        </div>
        <div className="hidden items-center gap-4 text-xs sm:flex">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#00f076]" />
            <span className="text-slate-300">Pemasukan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#f43f5e]" />
            <span className="text-slate-300">Pengeluaran</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[250px] flex-col justify-end gap-2" aria-label="Memuat grafik">
          <div className="flex h-40 items-end gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-t-md"
                style={{ height: `${30 + ((i * 37) % 70)}%` }}
              />
            ))}
          </div>
          <Skeleton className="h-4 w-full" />
        </div>
      ) : !hasData ? (
        <div className="flex h-[250px] flex-col items-center justify-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-full border border-[#1c2225] bg-[#14191b]">
            <ChartBar className="size-5 text-slate-500" />
          </div>
          <p className="text-sm font-medium text-white">
            Belum ada data pada periode ini
          </p>
          <p className="max-w-[240px] text-xs text-slate-400">
            Grafik akan otomatis terisi begitu ada transaksi tercatat.
          </p>
        </div>
      ) : (
        <div className="h-[250px] w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === "month" ? (
              <BarChart
                data={data}
                margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
                barGap={1}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#1c2225"
                />
                <XAxis
                  dataKey="label"
                  tick={axisTickStyle}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={axisTickStyle}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(value: number) => formatCompactIDR(value)}
                />
                <Tooltip
                  content={<CurrencyTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar
                  dataKey="income"
                  name="Pemasukan"
                  fill={INCOME_COLOR}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={10}
                />
                <Bar
                  dataKey="expense"
                  name="Pengeluaran"
                  fill={EXPENSE_COLOR}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={10}
                />
              </BarChart>
            ) : (
              <AreaChart
                data={data}
                margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={INCOME_COLOR} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={INCOME_COLOR} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={EXPENSE_COLOR} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={EXPENSE_COLOR} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#1c2225"
                />
                <XAxis dataKey="label" tick={axisTickStyle} tickLine={false} axisLine={false} />
                <YAxis
                  tick={axisTickStyle}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(value: number) => formatCompactIDR(value)}
                />
                <Tooltip
                  content={<CurrencyTooltip />}
                  cursor={{ stroke: "#1c2225" }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Pemasukan"
                  stroke={INCOME_COLOR}
                  strokeWidth={2}
                  fill="url(#incomeGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Pengeluaran"
                  stroke={EXPENSE_COLOR}
                  strokeWidth={2}
                  fill="url(#expenseGradient)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
        <span>
          {avgLabel}:{" "}
          <strong className="font-mono font-semibold text-white">
            {formatIDR(Math.round(avgExpense))}
          </strong>
        </span>
{hasData && !loading ? (
          <span className="text-slate-500">
            Total: <strong className="font-mono text-white">{formatIDR(totalExpense)}</strong>
          </span>
        ) : null}
      </div>
    </div>
  )
}
