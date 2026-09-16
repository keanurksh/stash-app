"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, PiggyBank, Target } from "lucide-react"

function formatRupiah(number: number): string {
  return "Rp " + number.toLocaleString("id-ID")
}

export function SavingsSimulator() {
  const [monthlyExpense, setMonthlyExpense] = useState(6_000_000)
  const [cutPercent, setCutPercent] = useState(15)

  const monthlySaved = Math.round(monthlyExpense * (cutPercent / 100))
  const yearlySaved = Math.round(monthlySaved * 12 * 1.05)

  return (
    <section
      id="calculator"
      className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28"
    >
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        {/* Copy */}
        <div className="space-y-4 lg:col-span-5">
          <span className="inline-block rounded-full border border-[#00f076]/20 bg-[#00f076]/10 px-3 py-1 font-space text-xs font-semibold tracking-[0.04em] text-[#b2ffbe]">
            SIMULATOR HEMAT BULANAN
          </span>
          <h2 className="font-space text-[26px] leading-8 font-bold tracking-[-0.01em] text-white md:text-[32px] md:leading-10 md:tracking-[-0.02em]">
            Lihat Berapa Banyak Uang Impulsif yang Bisa Kamu Selamatkan.
          </h2>
          <p className="font-jakarta text-[15px] leading-[22px] text-[#bacbb8]">
            Pangkas jajan tak sadar (boba harian, ojol jarak dekat,
            subscription lupa cancel) hanya 15-20% menggunakan tracking Stash,
            dan amati pertumbuhan tabunganmu dalam setahun.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <PiggyBank className="size-5 text-[#00f076]" />
              <span className="font-jakarta text-[13px] leading-[18px] text-[#e0e3e4]">
                Otomatis terlihat di net cash flow bulananmu
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Target className="size-5 text-[#00f076]" />
              <span className="font-jakarta text-[13px] leading-[18px] text-[#e0e3e4]">
                Visualisasi grafik yang mendorong disiplin finansial
              </span>
            </div>
          </div>
        </div>

        {/* Calculator card */}
        <div className="rounded-2xl border border-[#3b4b3c]/40 bg-[#181c1d] p-6 shadow-[0_0_20px_-5px_rgba(0,240,118,0.15)] sm:p-8 lg:col-span-7">
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="monthly-expense"
                className="font-space text-xs font-semibold tracking-[0.04em] text-[#e0e3e4]"
              >
                Total Pengeluaran Bulanan Kamu
              </label>
              <span className="font-space text-xl leading-7 font-bold text-[#b2ffbe]">
                {formatRupiah(monthlyExpense)}
              </span>
            </div>
            <input
              id="monthly-expense"
              type="range"
              min={2_000_000}
              max={25_000_000}
              step={500_000}
              value={monthlyExpense}
              onChange={(e) => setMonthlyExpense(Number(e.target.value))}
              className="slider-mint h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#313536]"
            />
            <div className="flex justify-between font-jakarta text-[11px] text-[#849584]">
              <span>Rp 2 Juta</span>
              <span>Rp 12 Juta</span>
              <span>Rp 25 Juta+</span>
            </div>
          </div>

          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="cut-percent"
                className="font-space text-xs font-semibold tracking-[0.04em] text-[#e0e3e4]"
              >
                Target Pangkas Pengeluaran Impulsif
              </label>
              <span className="font-space text-xl leading-7 font-bold text-[#4edea3]">
                {cutPercent}%
              </span>
            </div>
            <input
              id="cut-percent"
              type="range"
              min={5}
              max={35}
              step={5}
              value={cutPercent}
              onChange={(e) => setCutPercent(Number(e.target.value))}
              className="slider-mint h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#313536]"
            />
            <div className="flex justify-between font-jakarta text-[11px] text-[#849584]">
              <span>5% (Santai)</span>
              <span>15% (Rekomendasi)</span>
              <span>35% (Mode Hemat Ekstrem)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-xl border border-[#3b4b3c]/30 bg-[#0b0f10] p-5 sm:grid-cols-2">
            <div>
              <span className="font-space text-[10px] font-bold tracking-[0.06em] text-[#bacbb8] uppercase">
                Hemat Tiap Bulan:
              </span>
              <p className="mt-1 font-space text-2xl leading-8 font-semibold tracking-[-0.01em] font-bold text-[#00f076]">
                {formatRupiah(monthlySaved)}
              </p>
              <span className="font-jakarta text-[11px] text-[#849584]">
                Bisa untuk tiket konser atau pos investasi
              </span>
            </div>
            <div className="sm:border-l sm:border-[#3b4b3c]/30 sm:pl-4">
              <span className="font-space text-[10px] font-bold tracking-[0.06em] text-[#bacbb8] uppercase">
                Akumulasi 1 Tahun (+ Yield):
              </span>
              <p className="mt-1 font-space text-2xl leading-8 font-semibold tracking-[-0.01em] font-bold text-white">
                {formatRupiah(yearlySaved)}
              </p>
              <span className="font-jakarta text-[11px] text-[#b2ffbe]">
                Sudah termasuk proyeksi bunga majemuk 5%
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00f076] py-3 font-space text-sm font-semibold tracking-[0.02em] font-bold text-[#003917] transition-all hover:bg-[#b2ffbe] active:scale-[0.98]"
          >
            Kunci Potensi Hemat Ini Sekarang
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
