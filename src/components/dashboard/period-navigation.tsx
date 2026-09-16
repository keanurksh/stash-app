"use client"

import { addMonths, addYears, format, subMonths, subYears } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

const MONTH_NAMES = Array.from({ length: 12 }, (_, i) =>
  format(new Date(2024, i, 1), "MMMM", { locale: localeID })
)

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => CURRENT_YEAR - 5 + i)

interface PeriodNavigationProps {
  viewMode: "month" | "year"
  month: number
  year: number
  onViewModeChange: (mode: "month" | "year") => void
  onPeriodChange: (month: number, year: number) => void
}

const selectClass =
  "cursor-pointer appearance-none rounded-lg border border-[#1c2225] bg-[#0b0f10] py-1.5 pl-3 text-xs font-medium text-slate-200 transition focus:border-[#00f076] focus:outline-none"

export function PeriodNavigation({
  viewMode,
  month,
  year,
  onViewModeChange,
  onPeriodChange,
}: PeriodNavigationProps) {
  const handlePrev = () => {
    if (viewMode === "month") {
      const next = subMonths(new Date(year, month, 1), 1)
      onPeriodChange(next.getMonth(), next.getFullYear())
    } else {
      const next = subYears(new Date(year, 0, 1), 1)
      onPeriodChange(month, next.getFullYear())
    }
  }

  const handleNext = () => {
    if (viewMode === "month") {
      const next = addMonths(new Date(year, month, 1), 1)
      onPeriodChange(next.getMonth(), next.getFullYear())
    } else {
      const next = addYears(new Date(year, 0, 1), 1)
      onPeriodChange(month, next.getFullYear())
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-[#1c2225] bg-[#101415] p-1.5">
      <div className="flex rounded-lg border border-[#1c2225]/60 bg-[#0b0f10] p-0.5">
        <button
          type="button"
          onClick={() => onViewModeChange("month")}
          className={
            viewMode === "month"
              ? "rounded-md bg-[#00f076] px-3.5 py-1.5 text-xs font-semibold text-[#070a0b] transition"
              : "px-3.5 py-1.5 text-xs font-medium text-slate-400 transition hover:text-white"
          }
        >
          Bulanan
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("year")}
          className={
            viewMode === "year"
              ? "rounded-md bg-[#00f076] px-3.5 py-1.5 text-xs font-semibold text-[#070a0b] transition"
              : "px-3.5 py-1.5 text-xs font-medium text-slate-400 transition hover:text-white"
          }
        >
          Tahunan
        </button>
      </div>

      <div className="mx-1 hidden h-5 w-px bg-[#1c2225] sm:block" />

      <button
        type="button"
        aria-label="Bulan sebelumnya"
        onClick={handlePrev}
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-[#1c2225] hover:text-white"
      >
        <ChevronLeft className="size-4" />
      </button>

      {viewMode === "month" ? (
        <div className="relative">
          <select
            aria-label="Bulan"
            value={month}
            onChange={(e) => onPeriodChange(Number(e.target.value), year)}
            className={`${selectClass} pr-8`}
          >
            {MONTH_NAMES.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>
          <Calendar className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
        </div>
      ) : null}

      <div className="relative">
        <select
          aria-label="Tahun"
          value={year}
          onChange={(e) => onPeriodChange(month, Number(e.target.value))}
          className={`${selectClass} pr-7`}
        >
          {YEAR_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
      </div>

      <button
        type="button"
        aria-label="Bulan berikutnya"
        onClick={handleNext}
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-[#1c2225] hover:text-white"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}
