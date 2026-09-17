import Link from "next/link"
import { PlayCircle, Plus, Zap } from "lucide-react"

import { GoogleIcon } from "@/components/landing/google-icon"

const WEEKLY_BARS = [
  { day: "Sen", height: "h-16", highlight: false },
  { day: "Sel", height: "h-24", highlight: false },
  { day: "Rab", height: "h-12", highlight: false },
  { day: "Kam", height: "h-20", highlight: false },
  { day: "Jum", height: "h-28", highlight: true },
  { day: "Sab", height: "h-20", highlight: "secondary" },
  { day: "Min", height: "h-14", highlight: false },
] as const

const SPLIT_ROWS = [
  { name: "Rian (Sushi Hiro)", amount: "Rp 87.500 (Lunas)", status: "paid" },
  { name: "Dinda (Sushi Hiro)", amount: "Rp 92.000 (Pending)", status: "pending" },
  { name: "Fikri (Sushi Hiro)", amount: "Rp 115.000 (Lunas)", status: "paid" },
] as const

export function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-4 pt-12 pb-20 md:px-8 md:py-24">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[250px] w-[320px] -translate-x-1/2 rounded-full bg-[#00f076]/10 blur-[70px] md:h-[350px] md:w-[600px] md:blur-[130px]" />

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#3b4b3c]/30 bg-[#1c2021] px-3 py-1 font-space text-[10px] font-bold tracking-[0.06em] text-[#bacbb8] uppercase">
          <span>Finansial Gen Z tanpa ribet</span>
          <span className="size-1 rounded-full bg-[#b2ffbe]" />
          <span>Zero manual spreadsheet</span>
        </div>

        <h1 className="max-w-3xl font-space text-[38px] leading-[44px] font-bold tracking-[-0.02em] text-white md:text-[56px] md:leading-[64px] md:tracking-[-0.03em]">
          Kelola Uang &amp; Split Bill{" "}
          <span className="bg-gradient-to-r from-[#b2ffbe] via-[#00f076] to-[#4edea3] bg-clip-text text-transparent">
            Tanpa Rasa Pusing.
          </span>
        </h1>

        <p className="max-w-2xl font-jakarta text-[15px] leading-[22px] text-[#bacbb8] md:text-[18px] md:leading-[28px]">
          Bantu kamu tracking jajan kopi, budgeting gaya hidup, sampai patungan
          nongkrong bareng circle. Otomatis, real-time, dan transparan dalam
          sekali tap.
        </p>

        <div className="flex w-full flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Link
            href="/login"
            className="group flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 font-space text-sm font-semibold tracking-[0.02em] font-bold text-[#0b0f10] shadow-lg transition-all duration-200 hover:bg-[#00f076] hover:shadow-glow-mint active:scale-95 sm:w-auto"
          >
            <GoogleIcon className="size-5" />
            <span className="transition-colors duration-200">
              Lanjutkan dengan Google
            </span>
          </Link>
          <Link
            href="#interactive-preview"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#3b4b3c] bg-[#1c2021] px-6 py-3.5 font-space text-sm font-semibold tracking-[0.02em] text-white transition-all duration-150 hover:border-[#00f076]/50 active:scale-95 sm:w-auto"
          >
            <PlayCircle className="size-4 text-[#00f076]" />
            Lihat Live Demo
          </Link>
        </div>

        <span className="inline-flex items-center gap-1.5 font-jakarta text-[13px] leading-[18px] text-[#849584]">
          <Zap className="size-3.5 text-[#00f076]" />
          Setup 10 detik &bull; Gratis selamanya &bull; Tanpa input kartu kredit
        </span>
      </div>

      {/* Dashboard mockup showcase */}
      <div
        id="interactive-preview"
        className="relative mx-auto mt-14 max-w-5xl rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#3b4b3c]/40 to-[#0b0f10]/10 p-2 shadow-xl"
      >
        <div className="flex items-center justify-between rounded-t-xl border-b border-[#3b4b3c]/30 bg-[#181c1d] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-[#ffb4ab]/70" />
            <span className="size-3 rounded-full bg-yellow-500/70" />
            <span className="size-3 rounded-full bg-[#00f076]/70" />
            <span className="ml-4 hidden font-space text-[10px] font-bold tracking-[0.06em] text-[#849584] sm:inline">
              app.stash.id/dashboard/overview
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 rounded-b-xl bg-[#0b0f10] p-4 sm:p-6 md:grid-cols-12">
          {/* Left: balances & cashflow */}
          <div className="space-y-4 md:col-span-8">
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#3b4b3c]/30 bg-[#181c1d] p-5 sm:flex-row sm:items-center">
              <div>
                <p className="font-space text-xs font-semibold tracking-[0.04em] text-[#bacbb8] uppercase">
                  Total Saldo Bersih
                </p>
                <h2 className="mt-1 font-space text-[26px] leading-8 font-bold tracking-[-0.01em] text-white md:text-[32px] md:leading-10 md:tracking-[-0.02em]">
                  Rp 14.850.000
                  <span className="text-sm font-normal text-[#00f076]">.00</span>
                </h2>
                <p className="mt-2 text-xs text-[#bacbb8]">
                  vs bulan lalu (surplus Rp 2.3M)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 rounded-lg bg-[#00f076] px-3 py-2 font-space text-[10px] font-bold tracking-[0.06em] text-[#003917] shadow-sm">
                  <Plus className="size-3.5" />
                  Split Bill
                </button>
                <button className="rounded-lg border border-[#3b4b3c]/50 bg-[#272b2c] px-3 py-2 font-space text-[10px] font-bold tracking-[0.06em] text-[#e0e3e4]">
                  Transfer
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#3b4b3c]/30 bg-[#181c1d] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-space text-xl leading-7 font-semibold text-white">
                    Arus Kas Mingguan
                  </h3>
                  <p className="mt-0.5 font-jakarta text-[13px] text-[#bacbb8]">
                    Senin - Minggu ini (Rata-rata hemat 24%)
                  </p>
                </div>
                <span className="rounded border border-[#00f076]/20 bg-[#1c2021] px-2.5 py-1 font-space text-[10px] font-bold tracking-[0.06em] text-[#b2ffbe]">
                  Otomatis Terkoreksi
                </span>
              </div>
              <div className="flex h-36 w-full items-end justify-between gap-2 px-2 pt-4">
                {WEEKLY_BARS.map((bar) => (
                  <div
                    key={bar.day}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className={
                        bar.highlight === true
                          ? `w-full rounded-t-md bg-[#00f076] shadow-lg shadow-[#00f076]/20 ${bar.height}`
                          : bar.highlight === "secondary"
                            ? `w-full rounded-t-md bg-[#4edea3] ${bar.height}`
                            : `w-full rounded-t-md bg-[#313536] transition-colors hover:bg-[#849584] ${bar.height}`
                      }
                    />
                    <span
                      className={
                        bar.highlight === true
                          ? "font-space text-xs font-bold text-[#b2ffbe]"
                          : "font-space text-xs text-[#849584]"
                      }
                    >
                      {bar.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: micro widgets */}
          <div className="space-y-4 md:col-span-4">
            <div className="relative overflow-hidden rounded-xl border border-[#3b4b3c]/30 bg-[#181c1d] p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-yellow-500/15 font-bold text-yellow-400">
                    <svg
                      className="size-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                      <line x1="6" x2="6" y1="2" y2="4" />
                      <line x1="10" x2="10" y1="2" y2="4" />
                      <line x1="14" x2="14" y1="2" y2="4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-space text-sm font-bold text-white">
                      Pos Kopi &amp; Cafe
                    </h4>
                    <p className="text-xs text-[#bacbb8]">Sisa budget bulanan</p>
                  </div>
                </div>
                <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-bold text-yellow-400">
                  42% Left
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#313536]">
                <div className="h-2 w-[58%] rounded-full bg-yellow-400" />
              </div>
              <p className="mt-2 text-[11px] text-[#849584]">
                Rp 420.000 tersisa dari target Rp 1.000.000
              </p>
            </div>

            <div className="rounded-xl border border-[#3b4b3c]/30 bg-[#181c1d] p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="size-4 text-[#00f076]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    <path d="M10 9H8" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                  </svg>
                  <span className="font-space text-sm font-bold text-white">
                    Split Bill Nongkrong
                  </span>
                </div>
                <span className="rounded bg-[#00f076]/10 px-1.5 py-0.5 font-space text-[10px] font-bold tracking-[0.06em] text-[#00f076]">
                  Active
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {SPLIT_ROWS.map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between border-b border-[#3b4b3c]/20 py-1.5 text-xs last:border-b-0"
                  >
                    <span className="text-[#e0e3e4]">{row.name}</span>
                    <span
                      className={
                        row.status === "paid"
                          ? "font-bold text-[#b2ffbe]"
                          : "font-bold text-yellow-400"
                      }
                    >
                      {row.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#00f076]/30 bg-gradient-to-br from-[#181c1d] to-[#00f076]/5 p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-space text-xs font-semibold tracking-[0.04em] font-bold text-[#b2ffbe]">
                  <svg
                    className="size-3.5 text-[#00f076]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                  Streak 18 Hari
                </span>
                <span className="font-space text-xs text-[#bacbb8]">
                  Level: Gold Saver
                </span>
              </div>
              <p className="mt-1 font-jakarta text-[13px] font-medium text-white">
                Konser Coldplay Tokyo 2025
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-[#bacbb8]">
                <span>
                  Terkumpul: <b className="text-white">Rp 4.2M</b>
                </span>
                <span>Target: 6.5M</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
