"use client"

import { useMemo, useState } from "react"
import { format, parseISO } from "date-fns"
import { id as localeID } from "date-fns/locale"
import {
  Download,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
  Pencil,
  ReceiptText,
  ScanLine,
  Search,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PaywallModal } from "@/components/paywall/paywall-modal"
import { getCategoryColor } from "@/components/dashboard/chart-utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  exportCsv,
  exportExcel,
  exportPdf,
} from "@/lib/export-transactions"
import { formatIDR } from "@/lib/format"
import { CategoryIcon } from "@/lib/icon-map"
import { usePlanStatus } from "@/lib/plan-gate"
import { cn } from "@/lib/utils"
import type { Category, Transaction, TransactionType } from "@/types"

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
  loading: boolean
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => Promise<boolean>
}

type TypeFilter = "all" | TransactionType

export function TransactionList({
  transactions,
  categories,
  loading,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const { isPro } = usePlanStatus()

  const handleExport = (
    formatType: "csv" | "excel" | "pdf"
  ) => {
    // Pro-only gate: free user diarahkan ke PaywallModal
    if (!isPro) {
      setPaywallOpen(true)
      return
    }
    try {
      if (formatType === "csv") {
        exportCsv(filtered, categories)
      } else if (formatType === "excel") {
        exportExcel(filtered, categories)
      } else {
        exportPdf(filtered, categories)
      }
      toast.success("Export berhasil")
    } catch (error) {
      if (error instanceof Error && error.message === "POPUP_BLOCKED") {
        toast.error("Popup diblokir browser", {
          description: "Izinkan popup untuk halaman ini lalu coba lagi.",
        })
      } else {
        toast.error("Gagal mengexport data")
      }
    }
  }

  const categoryIndex = useMemo(() => {
    const map = new Map<string, number>()
    categories.forEach((c, i) => map.set(c.id, i))
    return map
  }, [categories])

  const filtered = transactions.filter((t) => {
    const q = query.trim().toLowerCase()
    if (typeFilter !== "all" && t.type !== typeFilter) return false
    if (categoryFilter !== "all") {
      if (categoryFilter === "none" && t.category_id !== null) return false
      if (categoryFilter !== "none" && t.category_id !== categoryFilter)
        return false
    }
    if (q) {
      const notes = (t.notes ?? "").toLowerCase()
      const categoryName =
        (t.category_id
          ? categories.find((c) => c.id === t.category_id)?.name
          : "") ?? ""
      if (
        !notes.includes(q) &&
        !categoryName.toLowerCase().includes(q) &&
        !String(t.amount).includes(q)
      ) {
        return false
      }
    }
    return true
  })

  const handleConfirmDelete = async () => {
    if (!deleting) return
    setDeleteLoading(true)
    const success = await onDelete(deleting)
    setDeleteLoading(false)
    setDeleting(null)
    if (success) {
      toast.success("Transaksi dihapus")
    }
  }

  const selectClass =
    "cursor-pointer appearance-none rounded-xl border border-[#1c2225] bg-[#0b0f10] px-3 py-2 text-xs text-slate-200 transition focus:border-[#00f076] focus:outline-none"

  return (
    <section className="glass-panel space-y-6 rounded-2xl border border-[#1c2225]/80 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-space text-lg font-bold tracking-tight text-white">
            Riwayat Transaksi
          </h2>
          <p className="text-xs text-slate-400">
            Semua aliran dana masuk dan keluar pada periode ini
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari catatan, kategori, nominal..."
              className="w-full rounded-xl border border-[#1c2225] bg-[#0b0f10] py-2 pl-9 pr-4 text-xs text-slate-200 transition placeholder:text-slate-500 focus:border-[#00f076] focus:outline-none focus:ring-1 focus:ring-[#00f076] sm:w-[260px]"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className={selectClass}
            aria-label="Filter tipe"
          >
            <option value="all">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={selectClass}
              aria-label="Filter kategori"
            >
              <option value="all">Semua Kategori</option>
              <option value="none">Tanpa Kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl border-[#1c2225] bg-[#0b0f10] text-xs text-slate-200 hover:bg-[#1c2225] hover:text-white"
                >
                  <Download className="size-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <FileText className="size-4" />
                  Export CSV
                  {!isPro ? (
                    <span className="ml-auto text-[9px] font-bold tracking-wider text-[#00f076]">PRO</span>
                  ) : null}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  <FileSpreadsheet className="size-4" />
                  Export Excel
                  {!isPro ? (
                    <span className="ml-auto text-[9px] font-bold tracking-wider text-[#00f076]">PRO</span>
                  ) : null}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  <FileText className="size-4" />
                  Export PDF
                  {!isPro ? (
                    <span className="ml-auto text-[9px] font-bold tracking-wider text-[#00f076]">PRO</span>
                  ) : null}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </div>

      <div>
        {loading ? (
          <div className="space-y-3 py-2" aria-label="Memuat transaksi">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <div className="mb-1 flex size-11 items-center justify-center rounded-full border border-[#1c2225] bg-[#14191b]">
              <ReceiptText className="size-5 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-white">
              {transactions.length === 0
                ? "Belum ada transaksi pada periode ini"
                : "Tidak ada transaksi yang cocok dengan filter"}
            </p>
            <p className="max-w-[260px] text-xs text-slate-400">
              {transactions.length === 0
                ? "Klik Tambah Transaksi atau scan screenshot mutasi untuk mulai mencatat."
                : "Coba ubah kata kunci atau filter pencarian."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop: tabel penuh */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#1c2225]/80 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                <th className="px-4 py-3">Deskripsi Transaksi</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Tanggal &amp; Waktu</th>
                <th className="px-4 py-3 text-right">Nominal</th>
                <th className="w-12 px-2 py-3" aria-label="Aksi" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2225]/40 text-sm">
              {filtered.map((t) => {
                const catIndex = t.category_id
                  ? (categoryIndex.get(t.category_id) ?? 0)
                  : 0
                const color = getCategoryColor(catIndex)
                const category = categories.find((c) => c.id === t.category_id)
                const isIncome = t.type === "income"
                const title = t.notes || category?.name || "Tanpa Kategori"
                const subtitle =
                  t.notes && category ? category.name : "Transaksi manual"
                let time = ""
                try {
                  time = format(parseISO(t.created_at), "HH:mm")
                } catch {
                  time = ""
                }

                return (
                  <tr
                    key={t.id}
                    className="group transition duration-150 hover:bg-[#14191b]/50"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-xl border",
                            isIncome
                              ? "border-[#00f076]/30 bg-[#00f076]/10 text-[#00f076]"
                              : color.box
                          )}
                        >
                          <CategoryIcon
                            name={category?.icon}
                            className="size-4"
                          />
                        </div>
                        <div className="min-w-0">
                          <div
                            className={cn(
                              "flex items-center gap-1.5 font-medium text-white transition group-hover:text-[#00f076]"
                            )}
                          >
                            <span className="truncate">{title}</span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {subtitle}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                          isIncome
                            ? "border-[#00f076]/20 bg-[#00f076]/10 text-[#00f076]"
                            : color.chip
                        )}
                      >
                        {category?.name ?? "Tanpa Kategori"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs whitespace-nowrap text-slate-300">
                      {format(parseISO(t.date), "dd MMM yyyy", {
                        locale: localeID,
                      })}
                      {time ? `, ${time}` : ""}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3.5 text-right font-mono font-semibold whitespace-nowrap",
                        isIncome ? "text-[#00f076]" : "text-rose-400"
                      )}
                    >
                      {isIncome ? "+" : "-"}
                      {formatIDR(t.amount)}
                    </td>
                    <td className="px-2 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-slate-400"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(t)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleting(t)}
                          >
                            <Trash2 className="size-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
              </table>
            </div>

            {/* Mobile: list card ringkas (kolom kategori disembunyikan) */}
            <div className="space-y-2 md:hidden">
              {filtered.map((t) => {
                const cardCatIndex = t.category_id
                  ? (categoryIndex.get(t.category_id) ?? 0)
                  : 0
                const cardColor = getCategoryColor(cardCatIndex)
                const cardCategory = categories.find(
                  (c) => c.id === t.category_id
                )
                const cardIsIncome = t.type === "income"
                const cardTitle =
                  t.notes || cardCategory?.name || "Tanpa Kategori"
                let cardTime = ""
                try {
                  cardTime = format(parseISO(t.created_at), "HH:mm")
                } catch {
                  cardTime = ""
                }
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl border border-[#1c2225]/60 bg-[#0b0f10]/60 p-3"
                  >
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl border",
                        cardIsIncome
                          ? "border-[#00f076]/30 bg-[#00f076]/10 text-[#00f076]"
                          : cardColor.box
                      )}
                    >
                      <CategoryIcon
                        name={cardCategory?.icon}
                        className="size-4"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {cardTitle}
                      </p>
                      <p className="text-[11px] whitespace-nowrap text-slate-400">
                        {format(parseISO(t.date), "dd MMM yyyy", {
                          locale: localeID,
                        })}
                        {cardTime ? `, ${cardTime}` : ""}
                      </p>
                    </div>
                    <p
                      className={cn(
                        "shrink-0 font-mono text-sm font-semibold whitespace-nowrap",
                        cardIsIncome ? "text-[#00f076]" : "text-rose-400"
                      )}
                    >
                      {cardIsIncome ? "+" : "-"}
                      {formatIDR(t.amount)}
                    </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 text-slate-400"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(t)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleting(t)}
                        >
                          <Trash2 className="size-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {!loading && filtered.length > 0 ? (
        <div className="flex items-center justify-between border-t border-[#1c2225]/60 pt-3 text-xs text-slate-400">
          <span>
            Menampilkan {filtered.length} dari {transactions.length} transaksi
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#00f076]">
            <ScanLine className="size-3.5" />
            Sinkron otomatis aktif
          </span>
        </div>
      ) : null}

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent className="w-full max-w-[calc(100%-2rem)] rounded-2xl border border-[#1c2225] bg-[#101415] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus transaksi?</DialogTitle>
            <DialogDescription>
              {deleting
                ? `Transaksi sebesar ${formatIDR(deleting.amount)}${
                    deleting.notes ? ` (${deleting.notes})` : ""
                  } akan dihapus permanen.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Batal
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
              className="bg-rose-500 text-white hover:bg-rose-600"
            >
              {deleteLoading ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="Export Data"
      />
    </section>
  )
}
