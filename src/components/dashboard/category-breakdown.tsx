"use client"

import { ChartPie } from "lucide-react"

import { formatIDR } from "@/lib/format"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import { getCategoryColor } from "@/components/dashboard/chart-utils"

export interface DonutDatum {
  name: string
  value: number
}

interface CategoryBreakdownProps {
  data: DonutDatum[]
  totalExpense: number
  loading: boolean
}

export function CategoryBreakdown({
  data,
  totalExpense,
  loading,
}: CategoryBreakdownProps) {
  return (
    <div className="glass-panel flex flex-col justify-between rounded-2xl border border-[#1c2225]/80 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-space text-base font-semibold text-white">
            Pengeluaran per Kategori
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Alokasi anggaran belanja
          </p>
        </div>
        <span className="rounded-lg border border-[#1c2225] bg-[#14191b] px-2 py-1 font-mono text-xs text-slate-400">
          {data.length} Kategori
        </span>
      </div>

      {loading ? (
        <div className="flex flex-1 flex-col justify-center gap-4 py-4" aria-label="Memuat kategori">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
          <div className="flex size-11 items-center justify-center rounded-full border border-[#1c2225] bg-[#14191b]">
            <ChartPie className="size-5 text-slate-500" />
          </div>
          <p className="text-sm font-medium text-white">
            Belum ada pengeluaran pada periode ini
          </p>
          <p className="max-w-[220px] text-xs text-slate-400">
            Catat pengeluaran pertamamu lewat tombol Tambah Transaksi.
          </p>
        </div>
      ) : (
        <div className="space-y-4 py-2">
          {data.map((entry, index) => {
            const color = getCategoryColor(index)
            const percent =
              totalExpense > 0
                ? ((entry.value / totalExpense) * 100).toFixed(1)
                : "0.0"
            return (
              <div key={entry.name} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex min-w-0 items-center gap-2 text-slate-200">
                    <span
                      className={cn("size-2 shrink-0 rounded-full", color.dot)}
                    />
                    <span className="truncate">{entry.name}</span>
                  </span>
                  <span className="shrink-0 text-right font-mono font-medium whitespace-nowrap text-white">
                    {formatIDR(entry.value)}{" "}
                    <span className="text-[11px] text-slate-400">
                      ({percent}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#1c2225]/70">
                  <div
                    className={`h-full rounded-full ${color.bar}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[#1c2225]/60 pt-3 text-xs">
        <span className="text-slate-400">Total Biaya Hidup</span>
        <span className="font-mono font-semibold text-[#00f076]">
          {formatIDR(totalExpense)}
        </span>
      </div>
    </div>
  )
}
