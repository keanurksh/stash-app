import { formatIDR, formatCompactIDR } from "@/lib/format"

export const INCOME_COLOR = "#00f076"
export const EXPENSE_COLOR = "#f43f5e"

export const CATEGORY_COLORS = [
  { hex: "#fbbf24", dot: "bg-amber-400", bar: "bg-amber-400", chip: "bg-amber-400/10 text-amber-300 border-amber-400/20", box: "bg-amber-400/10 border-amber-400/20 text-amber-400" },
  { hex: "#22d3ee", dot: "bg-cyan-400", bar: "bg-cyan-400", chip: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20", box: "bg-cyan-400/10 border-cyan-400/20 text-cyan-400" },
  { hex: "#818cf8", dot: "bg-indigo-400", bar: "bg-indigo-400", chip: "bg-indigo-400/10 text-indigo-300 border-indigo-400/20", box: "bg-indigo-400/10 border-indigo-400/20 text-indigo-400" },
  { hex: "#f472b6", dot: "bg-pink-400", bar: "bg-pink-400", chip: "bg-pink-400/10 text-pink-300 border-pink-400/20", box: "bg-pink-400/10 border-pink-400/20 text-pink-400" },
  { hex: "#34d399", dot: "bg-emerald-400", bar: "bg-emerald-400", chip: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20", box: "bg-emerald-400/10 border-emerald-400/20 text-emerald-400" },
  { hex: "#38bdf8", dot: "bg-sky-400", bar: "bg-sky-400", chip: "bg-sky-400/10 text-sky-300 border-sky-400/20", box: "bg-sky-400/10 border-sky-400/20 text-sky-400" },
  { hex: "#fb923c", dot: "bg-orange-400", bar: "bg-orange-400", chip: "bg-orange-400/10 text-orange-300 border-orange-400/20", box: "bg-orange-400/10 border-orange-400/20 text-orange-400" },
  { hex: "#a78bfa", dot: "bg-violet-400", bar: "bg-violet-400", chip: "bg-violet-400/10 text-violet-300 border-violet-400/20", box: "bg-violet-400/10 border-violet-400/20 text-violet-400" },
] as const

export function getCategoryColor(index: number) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length]
}

interface TooltipEntry {
  name?: string | number
  value?: number | string
  color?: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
}

export function CurrencyTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-lg border border-[#1c2225] bg-[#161b1e] px-3 py-2 text-popover-foreground shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      {label !== undefined ? (
        <p className="mb-1 text-xs font-medium text-slate-400">{label}</p>
      ) : null}
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-300">{entry.name}</span>
          <span className="ml-auto font-medium tabular-nums">
            {formatIDR(Number(entry.value ?? 0))}
          </span>
        </div>
      ))}
    </div>
  )
}

export const axisTickStyle = {
  fontSize: 11,
  fill: "#64748b",
} as const

export { formatCompactIDR }
