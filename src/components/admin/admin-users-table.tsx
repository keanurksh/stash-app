"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw, Search, ShieldCheck, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AdminUserRow {
  id: string
  email: string
  full_name: string | null
  role: string
  plan: "free" | "pro"
  ocr_used: number
  streak: number
  saving_level: string
}

export function AdminUsersTable() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Gagal memuat user")
      }
      const data = await res.json()
      setUsers(data.users ?? [])
    } catch (error) {
      toast.error("Gagal memuat daftar user", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      // Tunda sampai microtask agar setState tidak terjadi
      // secara sinkron di dalam effect body
      await Promise.resolve()
      if (!cancelled) {
        void loadUsers()
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadUsers])

  const togglePlan = async (user: AdminUserRow) => {
    setTogglingId(user.id)
    try {
      const nextPlan = user.plan === "pro" ? "free" : "pro"
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, plan: nextPlan }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Gagal mengubah plan")
      }
      toast.success(
        nextPlan === "pro"
          ? `${user.email} diaktivasi ke Pro`
          : `${user.email} diturunkan ke Free`
      )
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, plan: nextPlan } : u))
      )
    } catch (error) {
      toast.error("Gagal mengubah plan", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setTogglingId(null)
    }
  }

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name ?? "").toLowerCase().includes(q)
    )
  })

  return (
    <section className="glass-panel space-y-5 rounded-2xl border border-[#1c2225]/80 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-space text-lg font-bold tracking-tight text-white">
            Manajemen User
          </h2>
          <p className="text-xs text-slate-400">
            Aktifkan Pro manual setelah terima bukti transfer via WhatsApp
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Cari email / nama..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-56 rounded-xl border-[#1c2225] bg-[#0b0f10] pl-9 text-xs text-slate-200 placeholder:text-slate-500 focus:border-[#00f076]"
            />
          </div>
          <button
            type="button"
            onClick={loadUsers}
            className="flex items-center gap-1.5 rounded-xl border border-[#1c2225] bg-[#0b0f10] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-[#00f076]/40 hover:text-white"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="space-y-3 py-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-[#14191b]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            {users.length === 0
              ? "Belum ada user terdaftar."
              : "Tidak ada user yang cocok dengan pencarian."}
          </p>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#1c2225]/80 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">OCR Terpakai</th>
                <th className="px-4 py-3">Streak</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2225]/40">
              {filtered.map((user) => (
                <tr key={user.id} className="group hover:bg-[#14191b]/50">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                          user.role === "admin"
                            ? "border-[#00f076]/30 bg-[#00f076]/10 text-[#00f076]"
                            : "border-[#1c2225] bg-[#14191b] text-slate-400"
                        )}
                      >
                        {user.role === "admin" ? (
                          <ShieldCheck className="size-4" />
                        ) : (
                          <Sparkles className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-medium text-white">
                          <span className="truncate">
                            {user.full_name ?? "(tanpa nama)"}
                          </span>
                          {user.role === "admin" ? (
                            <span className="rounded bg-[#00f076]/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-[#00f076]">
                              ADMIN
                            </span>
                          ) : null}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                        user.plan === "pro"
                          ? "border-[#00f076]/30 bg-[#00f076]/10 text-[#00f076]"
                          : "border-slate-600 bg-slate-700/40 text-slate-300"
                      )}
                    >
                      {user.plan.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-300">
                    {user.ocr_used}/7
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-300">
                    {user.streak} hari
                    <span className="ml-1 text-slate-500">
                      ({user.saving_level})
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => togglePlan(user)}
                      disabled={togglingId === user.id}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition active:scale-[0.97] disabled:opacity-60",
                        user.plan === "pro"
                          ? "border border-[#1c2225] bg-transparent text-slate-300 hover:border-rose-500/40 hover:text-rose-400"
                          : "bg-[#00f076] text-[#070a0b] shadow-glow-mint hover:bg-[#00dc6c]"
                      )}
                    >
                      {togglingId === user.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="size-3.5" />
                      )}
                      {user.plan === "pro" ? "Turunkan ke Free" : "Aktifkan Pro"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
