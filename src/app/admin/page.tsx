import { Coins, ReceiptText, ScanLine, Users } from "lucide-react"

import { AdminUsersTable } from "@/components/admin/admin-users-table"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Admin Dashboard",
}

interface AdminStats {
  totalUsers: number
  totalPro: number
  totalTransactions: number
  totalOcrUsed: number
}

async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient()

  const [usersResult, transactionsResult, subscriptionsResult] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("transactions").select("id", { count: "exact", head: true }),
      supabase.from("subscriptions").select("status, ocr_usage_count"),
    ])

  const subscriptions = subscriptionsResult.data ?? []
  const totalPro = subscriptions.filter((s) => s.status === "pro").length
  const totalOcrUsed = subscriptions.reduce(
    (sum, s) => sum + (s.ocr_usage_count ?? 0),
    0
  )

  return {
    totalUsers: usersResult.count ?? 0,
    totalPro,
    totalTransactions: transactionsResult.count ?? 0,
    totalOcrUsed,
  }
}

const STAT_STYLES = [
  {
    label: "Total Registered Users",
    icon: Users,
    iconClasses: "border-[#00f076]/30 bg-[#00f076]/10 text-[#00f076]",
    valueClasses: "text-white",
    blurClasses: "bg-[#00f076]/10",
  },
  {
    label: "Pro Subscribers",
    icon: Coins,
    iconClasses: "border-amber-500/30 bg-amber-500/15 text-amber-400",
    valueClasses: "text-amber-400",
    blurClasses: "bg-amber-500/10",
  },
  {
    label: "Total Transaksi",
    icon: ReceiptText,
    iconClasses: "border-cyan-500/30 bg-cyan-500/15 text-cyan-400",
    valueClasses: "text-cyan-400",
    blurClasses: "bg-cyan-500/10",
  },
  {
    label: "Kuota OCR Terpakai",
    icon: ScanLine,
    iconClasses: "border-rose-500/30 bg-rose-500/15 text-rose-400",
    valueClasses: "text-rose-400",
    blurClasses: "bg-rose-500/10",
  },
] as const

export default async function AdminPage() {
  const stats = await getAdminStats()

  const values = [
    String(stats.totalUsers),
    String(stats.totalPro),
    String(stats.totalTransactions),
    String(stats.totalOcrUsed),
  ]

  const conversion =
    stats.totalUsers > 0
      ? ((stats.totalPro / stats.totalUsers) * 100).toFixed(1)
      : "0.0"

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-space text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
          <span>Metrik platform real-time</span>
          <span className="inline-block size-1 rounded-full bg-slate-500" />
          <span className="rounded border border-[#00f076]/20 bg-[#00f076]/8 px-2 py-0.5 text-xs font-medium text-[#00f076]">
            Konversi Pro: {conversion}%
          </span>
        </p>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {STAT_STYLES.map((stat, index) => (
          <div
            key={stat.label}
            className="glass-panel group relative overflow-hidden rounded-2xl border border-[#1c2225]/80 p-5 transition-all duration-300 hover:border-[#00f076]/40"
          >
            <div
              className={`pointer-events-none absolute -bottom-6 -right-6 size-28 rounded-full blur-2xl ${stat.blurClasses}`}
            />
            <div className="flex items-center gap-4">
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-xl border ${stat.iconClasses}`}
              >
                <stat.icon className="size-6" strokeWidth={2.2} />
              </div>
              <div>
                <p className="text-xs font-medium tracking-wider text-slate-400 uppercase">
                  {stat.label}
                </p>
                <p
                  className={`mt-1 font-space text-2xl font-bold tabular-nums ${stat.valueClasses}`}
                >
                  {values[index]}
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <AdminUsersTable />

      <section className="glass-panel rounded-2xl border border-[#1c2225]/80 p-6">
        <h2 className="font-space text-base font-semibold text-white">
          Catatan Admin
        </h2>
        <ul className="mt-3 space-y-2 font-jakarta text-sm text-slate-400">
          <li>
            &bull; Angka di atas dihitung langsung dari database setiap kali
            halaman dibuka (tanpa cache).
          </li>
          <li>
            &bull; Untuk mem-promote admin baru, jalankan di SQL Editor:{" "}
            <code className="rounded bg-[#0b0f10] px-1.5 py-0.5 font-mono text-xs text-[#00f076]">
              update profiles set role = &apos;admin&apos; where id = (select id
              from auth.users where email = &apos;...&apos;);
            </code>
          </li>
          <li>
            &bull; Akses halaman ini difilter dua lapis: middleware (role check)
            dan layout server-side (verifikasi ulang).
          </li>
        </ul>
      </section>
    </div>
  )
}
