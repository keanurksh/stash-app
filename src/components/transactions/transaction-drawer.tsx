"use client"

import { useEffect, useRef, useState } from "react"
import { format, parseISO } from "date-fns"
import { id as localeID } from "date-fns/locale"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarIcon,
  Check,
  CheckCircle2,
  ImageIcon,
  Loader2,
  Lock,
  Plus,
  ScanLine,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { PaywallModal } from "@/components/paywall/paywall-modal"
import { WalletCreateDialog } from "@/components/wallets/wallet-create-dialog"
import { useOcrQuota } from "@/hooks/use-ocr-quota"
import { usePlanStatus } from "@/lib/plan-gate"
import {
  ResponsiveDialog,
  ResponsiveDialogDescription,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatAmountInput, formatIDR, parseDigitsToNumber } from "@/lib/format"
import { CategoryIcon } from "@/lib/icon-map"
import { parseOcrText } from "@/lib/ocr-parser"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { Category, Transaction, TransactionType, Wallet } from "@/types"

interface TransactionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  wallets: Wallet[]
  editing: Transaction | null
  formKey: number
  userId: string
  onSaved: () => void
  onWalletCreated?: () => void
  /** Tab awal saat drawer dibuka (quick action Scan langsung ke tab OCR) */
  initialTab?: "manual" | "ocr"
}

export function TransactionDrawer({
  open,
  onOpenChange,
  categories,
  wallets,
  editing,
  formKey,
  userId,
  onSaved,
  onWalletCreated,
  initialTab = "manual",
}: TransactionDrawerProps) {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      desktopClassName="flex max-h-[90vh] w-full max-w-[calc(100%-2rem)] flex-col overflow-hidden rounded-3xl border border-[#1c2225] bg-[#101415] p-0 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] sm:max-w-lg"
    >
      <div className="flex items-center justify-between border-b border-[#1c2225]/80 px-6 pt-6 pb-4">
        <div>
          <ResponsiveDialogTitle className="font-space text-lg font-bold text-white">
            {editing ? "Edit Transaksi" : "Tambah Transaksi"}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="mt-0.5 text-xs text-slate-400">
            {editing
              ? "Perbarui detail transaksi di bawah ini."
              : "Input manual atau scan screenshot mutasi otomatis."}
          </ResponsiveDialogDescription>
        </div>
        <button
          type="button"
          aria-label="Tutup modal"
          onClick={() => onOpenChange(false)}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-[#1c2225] hover:text-white"
        >
          <X className="size-5" />
        </button>
      </div>

      <ModalBody
        key={formKey}
        editing={editing}
        categories={categories}
        wallets={wallets}
        userId={userId}
        initialTab={initialTab}
        onDone={() => {
          onSaved()
          onOpenChange(false)
        }}
        onWalletCreated={onWalletCreated}
      />
    </ResponsiveDialog>
  )
}

function todayISO(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

interface DrawerBodyProps {
  editing: Transaction | null
  categories: Category[]
  wallets: Wallet[]
  userId: string
  initialTab: "manual" | "ocr"
  onDone: () => void
  onWalletCreated?: () => void
}

function ModalBody({
  editing,
  categories,
  wallets,
  userId,
  initialTab,
  onDone,
  onWalletCreated,
}: DrawerBodyProps) {
  const [type, setType] = useState<TransactionType>(editing?.type ?? "expense")
  const [amount, setAmount] = useState(() =>
    editing?.amount ? formatAmountInput(String(Math.round(editing.amount))) : ""
  )
  const [categoryId, setCategoryId] = useState(editing?.category_id ?? "none")
  const [walletId, setWalletId] = useState(
    editing?.wallet_id ??
      wallets.find((w) => w.is_default)?.id ??
      wallets[0]?.id ??
      "none"
  )
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)
  const [dateISO, setDateISO] = useState(editing?.date ?? todayISO())
  const [notes, setNotes] = useState(editing?.notes ?? "")
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<"manual" | "ocr">(initialTab)

  const [ocrFile, setOcrFile] = useState<File | null>(null)
  const [ocrPreview, setOcrPreview] = useState<string | null>(null)
  const [ocrProcessing, setOcrProcessing] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrDone, setOcrDone] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const quota = useOcrQuota()
  const { isPro } = usePlanStatus()

  const quotaExhausted =
    quota.status !== "pro" &&
    !quota.loading &&
    quota.ocrRemaining !== null &&
    quota.ocrRemaining <= 0
  const quotaLow =
    !quotaExhausted &&
    quota.status !== "pro" &&
    !quota.loading &&
    quota.ocrRemaining !== null &&
    quota.ocrRemaining > 0 &&
    quota.ocrRemaining <= 2

  const handleTypeChange = (value: TransactionType) => {
    setType(value)
    const current = categories.find((c) => c.id === categoryId)
    if (current && current.type !== value) {
      setCategoryId("none")
    }
  }

  // Tipe yang didukung worker Tesseract self-hosted + batas aman memori browser.
  // Berlaku untuk semua jalur masuk file: tombol upload, paste (Ctrl+V), drag & drop.
  const ALLOWED_OCR_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"]
  const MAX_OCR_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  const handleFileChange = (file: File | null) => {
    setOcrDone(false)
    if (!file) return
    if (!ALLOWED_OCR_MIME_TYPES.includes(file.type)) {
      toast.error("Format file tidak didukung", {
        description: "Gunakan screenshot PNG, JPG, atau WebP.",
      })
      return
    }
    if (file.size > MAX_OCR_FILE_SIZE) {
      toast.error("File terlalu besar", {
        description: "Ukuran maksimal screenshot adalah 5MB.",
      })
      return
    }
    if (ocrPreview) URL.revokeObjectURL(ocrPreview)
    setOcrFile(file)
    setOcrPreview(URL.createObjectURL(file))
    setTab("ocr")
  }

  const handleClearFile = () => {
    if (ocrPreview) URL.revokeObjectURL(ocrPreview)
    setOcrFile(null)
    setOcrPreview(null)
    setOcrProcessing(false)
    setOcrProgress(0)
    setOcrDone(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Ref agar listener window selalu memanggil versi handleFileChange terbaru
  const handleFileChangeRef = useRef(handleFileChange)
  useEffect(() => {
    handleFileChangeRef.current = handleFileChange
  })

  // Paste (Ctrl+V) & drag-and-drop screenshot dari luar browser.
  // Window-level drop mencegah default browser membuka file di tab baru.
  useEffect(() => {
    if (editing) return

    const extractImage = (transfer: DataTransfer | null): File | null => {
      const file = Array.from(transfer?.files ?? [])[0]
      return file ?? null
    }

    const handlePaste = (e: ClipboardEvent) => {
      const file = extractImage(e.clipboardData)
      if (!file) return
      e.preventDefault()
      handleFileChangeRef.current(file)
    }

    const preventOpen = (e: DragEvent) => {
      e.preventDefault()
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      const file = extractImage(e.dataTransfer)
      if (!file) return
      handleFileChangeRef.current(file)
    }

    window.addEventListener("paste", handlePaste)
    window.addEventListener("dragover", preventOpen)
    window.addEventListener("drop", handleDrop)
    return () => {
      window.removeEventListener("paste", handlePaste)
      window.removeEventListener("dragover", preventOpen)
      window.removeEventListener("drop", handleDrop)
    }
  }, [editing])

  const handleProcessOcr = async () => {
    if (!ocrFile || ocrProcessing) return

    // Entitlement gate: cek kuota dulu (tanpa konsumsi).
    // Free: 7x/bulan. Jika habis, tampilkan PaywallModal.
    let allowed: boolean
    try {
      allowed = await quota.consumeScan(false)
    } catch {
      toast.error("Gagal memeriksa kuota OCR", {
        description: "Periksa koneksi internet dan coba lagi.",
      })
      return
    }
    if (!allowed) {
      setPaywallOpen(true)
      return
    }

    setOcrProcessing(true)
    setOcrProgress(0)
    setOcrDone(false)

    try {
      const { createWorker } = await import("tesseract.js")
      const worker = await createWorker("eng", 1, {
        // Self-hosted assets: tidak bergantung CDN eksternal
        workerPath: "/tesseract/worker.min.js",
        corePath: "/tesseract/core",
        langPath: "/tesseract/lang",
        workerBlobURL: false,
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100))
          }
        },
      })
      const { data } = await worker.recognize(ocrFile)
      await worker.terminate()

      // Kuota hanya dikonsumsi setelah scan benar-benar sukses
      await quota
        .consumeScan(true)
        .catch(() => toast.warning("Kuota gagal tercatat", {
          description: "Scan berhasil, tapi penggunaan kuota mungkin tidak tersimpan.",
        }))

      const parsed = parseOcrText(data.text ?? "")
      if (!parsed.amount && !parsed.date) {
        toast.error("Tidak dapat membaca nominal/tanggal", {
          description:
            "Coba gunakan screenshot yang lebih jelas, atau input manual.",
        })
      } else {
        if (parsed.amount) {
          setAmount(formatAmountInput(String(parsed.amount)))
        }
        if (parsed.date) {
          setDateISO(parsed.date)
        }
        setType(parsed.type)
        toast.success("Screenshot berhasil dipindai")
      }
      setOcrDone(true)
    } catch (error) {
      console.error("OCR failed:", error)
      toast.error("Gagal memproses gambar", {
        description:
          "Engine OCR gagal dimuat. Coba refresh halaman, atau input manual.",
      })
    } finally {
      setOcrProcessing(false)
    }
  }

  const handleSubmit = async () => {
    const value = parseDigitsToNumber(amount)
    if (value <= 0) {
      toast.error("Nominal harus lebih dari 0")
      return
    }

    setSaving(true)
    const supabase = createClient()
    const payload = {
      user_id: userId,
      category_id: categoryId === "none" ? null : categoryId,
      wallet_id: walletId === "none" ? null : walletId,
      amount: value,
      type,
      date: dateISO,
      notes: notes.trim() || null,
    }

    const { error } = editing
      ? await supabase.from("transactions").update(payload).eq("id", editing.id)
      : await supabase.from("transactions").insert(payload)

    setSaving(false)

    if (error) {
      toast.error("Gagal menyimpan transaksi", { description: error.message })
      return
    }

    toast.success(editing ? "Transaksi diperbarui" : "Transaksi tersimpan")
    onDone()
  }

  const dateObj = dateISO ? parseISO(dateISO) : null
  const parsedAmountPreview = parseDigitsToNumber(amount)

  const inputClass =
    "rounded-xl border border-[#1c2225] bg-[#0b0f10] text-slate-200 transition focus:border-[#00f076] focus:ring-1 focus:ring-[#00f076] focus:outline-none"

  return (
    <>
      <div className="space-y-5 overflow-y-auto p-6 text-sm">
        {!editing ? (
          <div className="grid grid-cols-2 rounded-xl border border-[#1c2225]/80 bg-[#0b0f10] p-1">
            <button
              type="button"
              onClick={() => setTab("manual")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition",
                tab === "manual"
                  ? "bg-[#00f076] text-[#070a0b] shadow-glow-mint"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => setTab("ocr")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition",
                tab === "ocr"
                  ? "bg-[#00f076] text-[#070a0b] shadow-glow-mint"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <ScanLine className="size-3.5" />
              Scan Screenshot
            </button>
          </div>
        ) : null}

        {/* OCR section */}
        {!editing && tab === "ocr" ? (
          <div className="space-y-4">
            {/* Kuota scan */}
            <div
              className={cn(
                "flex items-center justify-between rounded-xl border bg-[#0b0f10] px-3.5 py-2 text-xs",
                quotaExhausted
                  ? "border-rose-500/40 bg-rose-500/8"
                  : quotaLow
                    ? "border-amber-500/40 bg-amber-500/8"
                    : "border-[#1c2225]"
              )}
            >
              <span
                className={cn(
                  "text-slate-400",
                  quotaExhausted && "font-medium text-rose-400"
                )}
              >
                {quotaExhausted
                  ? "Kuota OCR bulan ini habis"
                  : "Kuota OCR bulan ini"}
              </span>
              {quota.status === "pro" ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#00f076]/30 bg-[#00f076]/10 px-2 py-0.5 font-semibold text-[#00f076]">
                  <Sparkles className="size-3" />
                  Pro Unlimited
                </span>
              ) : (
                <span
                  className={cn(
                    "font-mono font-semibold",
                    quotaExhausted
                      ? "text-rose-400"
                      : quotaLow
                        ? "text-amber-400"
                        : "text-white"
                  )}
                >
                  {Math.max(0, quota.ocrLimit! - quota.ocrUsed)}/
                  {quota.ocrLimit}{" "}
                  <span className="font-sans font-normal text-slate-500">
                    scan tersisa
                  </span>
                </span>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />

            {ocrPreview ? (
              <div className="relative overflow-hidden rounded-2xl border border-[#00f076]/30 bg-[#0b0f10] p-4">
                <div className="mb-3 flex items-center justify-between border-b border-[#1c2225]/60 pb-2 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="size-2 animate-pulse rounded-full bg-[#00f076]" />
                    Bukti Pembayaran Terdeteksi
                  </span>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="text-slate-400 transition hover:text-rose-400"
                    aria-label="Hapus gambar"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ocrPreview}
                  alt="Preview screenshot"
                  className="max-h-56 w-full rounded-xl bg-[#14191b] object-contain"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                className={cn(
                  "flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed bg-[#0b0f10] p-8 text-center transition-colors",
                  dragActive
                    ? "border-[#00f076] bg-[#00f076]/5"
                    : "border-[#1c2225] hover:border-[#00f076]/40"
                )}
              >
                <div className="flex size-12 items-center justify-center rounded-xl border border-[#1c2225] bg-[#14191b]">
                  <ImageIcon
                    className={cn(
                      "size-5",
                      dragActive ? "text-[#00f076]" : "text-slate-400"
                    )}
                  />
                </div>
                <p className="text-sm font-medium text-white">
                  {dragActive
                    ? "Lepas untuk mengunggah"
                    : "Upload Screenshot Mutasi"}
                </p>
                <p className="font-jakarta text-xs text-slate-400">
                  Klik, drag & drop, atau paste (Ctrl+V) screenshot di sini.
                  Nominal & tanggal terisi otomatis
                </p>
              </button>
            )}

            {ocrProcessing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Loader2 className="size-3.5 animate-spin text-[#00f076]" />
                  Memindai teks... {ocrProgress}%
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1c2225]">
                  <div
                    className="h-full rounded-full bg-[#00f076] transition-all"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
              </div>
            ) : ocrPreview && !ocrDone ? (
              quotaExhausted ? (
                <button
                  type="button"
                  onClick={() => setPaywallOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#00f076]/50 bg-[#00f076]/10 py-2.5 text-sm font-bold text-[#00f076] transition hover:bg-[#00f076]/20 active:scale-[0.99]"
                >
                  <Sparkles className="size-4" />
                  Upgrade ke Pro untuk Unlimited Scan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleProcessOcr}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00f076] py-2.5 text-sm font-bold text-[#070a0b] shadow-glow-mint transition hover:bg-[#00dc6c] active:scale-[0.99]"
                >
                  <ScanLine className="size-4" />
                  Pindai Screenshot
                </button>
              )
            ) : null}

            {ocrDone ? (
              <div className="flex items-start gap-3 rounded-xl border border-[#00f076]/30 bg-[#00f076]/8 p-3.5">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#00f076]" />
                <div>
                  <p className="text-xs font-medium text-[#00f076]">
                    Hasil scan terisi di form berikut.
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-300">
                    {parsedAmountPreview > 0 ? (
                      <>
                        Nominal:{" "}
                        <span className="font-mono font-semibold text-white">
                          {formatIDR(parsedAmountPreview)}
                        </span>{" "}
                        &bull;{" "}
                      </>
                    ) : null}
                    Pilih kategori lalu simpan.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Form */}
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition",
                type === "expense"
                  ? "border-2 border-[#00f076] bg-[#00f076]/8 text-[#00f076]"
                  : "border border-[#1c2225] bg-[#0b0f10] text-slate-400 hover:border-slate-500 hover:text-white"
              )}
            >
              <ArrowDownCircle className="size-4" />
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition",
                type === "income"
                  ? "border-2 border-[#00f076] bg-[#00f076]/8 text-[#00f076]"
                  : "border border-[#1c2225] bg-[#0b0f10] text-slate-400 hover:border-slate-500 hover:text-white"
              )}
            >
              <ArrowUpCircle className="size-4" />
              Pemasukan
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-xs font-medium text-slate-300">
              Nominal
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-[#00f076]">
                Rp
              </span>
              <Input
                id="amount"
                inputMode="numeric"
                placeholder="0"
                className={cn(inputClass, "pl-11 font-mono text-base font-bold text-white")}
                value={amount}
                onChange={(e) => setAmount(formatAmountInput(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-300">Kategori</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className={cn(inputClass, "w-full")}>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tanpa Kategori</SelectItem>
                {categories
                  .filter((c) => c.type === type)
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center gap-2">
                        <CategoryIcon name={category.icon} className="size-4" />
                        {category.name}
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-300">Dompet</Label>
            <Select
              value={walletId}
              onValueChange={(value) => {
                if (value === "add") {
                  if (isPro) {
                    setWalletDialogOpen(true)
                  } else {
                    setPaywallOpen(true)
                  }
                  return
                }
                setWalletId(value)
              }}
            >
              <SelectTrigger className={cn(inputClass, "w-full")}>
                <SelectValue placeholder="Pilih dompet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    <span className="flex items-center gap-2">
                      {wallet.name}
                      {wallet.is_default ? (
                        <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase">
                          Utama
                        </span>
                      ) : null}
                    </span>
                  </SelectItem>
                ))}
                <SelectItem value="add">
                  <span className="flex items-center gap-2 text-[#00f076]">
                    {isPro ? (
                      <Plus className="size-3.5" />
                    ) : (
                      <Lock className="size-3.5" />
                    )}
                    Tambah Dompet
                    {!isPro ? (
                      <span className="text-[9px] font-bold tracking-wider uppercase">
                        (Pro)
                      </span>
                    ) : null}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-300">
              Tanggal Transaksi
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    inputClass,
                    "w-full justify-start px-3.5 py-2.5 text-left font-normal text-slate-200 hover:bg-[#0b0f10] hover:text-white"
                  )}
                >
                  {dateObj
                    ? format(dateObj, "EEEE, d MMMM yyyy", { locale: localeID })
                    : "Pilih tanggal"}
                  <CalendarIcon className="ml-auto size-4 text-slate-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateObj ?? undefined}
                  defaultMonth={dateObj ?? undefined}
                  locale={localeID}
                  onSelect={(selected) => {
                    if (selected) {
                      setDateISO(
                        `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, "0")}-${String(selected.getDate()).padStart(2, "0")}`
                      )
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-medium text-slate-300">
              Catatan (Opsional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Contoh: Makan siang, kopi susu, bensin..."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={cn(inputClass, "text-xs placeholder:text-slate-600")}
            />
          </div>
        </form>
      </div>

      <div className="border-t border-[#1c2225]/80 bg-[#101415] p-6 pt-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00f076] px-4 py-3 text-sm font-bold text-[#070a0b] shadow-glow-mint transition hover:bg-[#00dc6c] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" strokeWidth={2.5} />
          )}
          Simpan Transaksi
        </button>
      </div>

      <PaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="Unlimited OCR Scan"
      />

      <WalletCreateDialog
        open={walletDialogOpen}
        onOpenChange={setWalletDialogOpen}
        userId={userId}
        onCreated={(wallet) => {
          onWalletCreated?.()
          setWalletId(wallet.id)
        }}
        onLimitHit={() => setPaywallOpen(true)}
      />
    </>
  )
}
