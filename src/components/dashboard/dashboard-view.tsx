"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfYear,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfYear,
} from "date-fns"
import { id as localeID } from "date-fns/locale"
import { motion } from "framer-motion"
import { Plus, ScanLine, Sparkles, Users } from "lucide-react"
import { toast } from "sonner"

import { PaywallModal } from "@/components/paywall/paywall-modal"

import { CategoryBreakdown, type DonutDatum } from "@/components/dashboard/category-breakdown"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MainChart, type ChartDatum } from "@/components/dashboard/main-chart"
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav"
import { PeriodNavigation } from "@/components/dashboard/period-navigation"
import { SmartInsight } from "@/components/dashboard/smart-insight"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { BudgetCapsSection } from "@/components/budget/budget-caps-section"
import { SplitBillSection } from "@/components/split-bills/split-bill-section"
import { TransactionDrawer } from "@/components/transactions/transaction-drawer"
import { TransactionList } from "@/components/transactions/transaction-list"
import { WalletsStrip } from "@/components/wallets/wallets-strip"
import { WishlistSection } from "@/components/wishlist/wishlist-section"
import { createClient } from "@/lib/supabase/client"
import { canCreateWithinFreeLimit, usePlanStatus } from "@/lib/plan-gate"
import type {
  BudgetCap,
  Category,
  DashboardUser,
  SplitBill,
  SplitBillItem,
  Transaction,
  Wallet,
  Wishlist,
} from "@/types"

const now = new Date()

/** Sapaan dinamis berdasarkan jam lokal pengguna (WIB-bebas, ikut device). */
function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return "Selamat Pagi"
  if (hour >= 12 && hour < 15) return "Selamat Siang"
  if (hour >= 15 && hour < 18) return "Selamat Sore"
  return "Selamat Malam"
}

interface DashboardViewProps {
  user: DashboardUser
  initialCategories: Category[]
  initialTransactions: Transaction[]
  initialWallets: Wallet[]
  initialWishlists: Wishlist[]
  initialSplitBills: SplitBill[]
  initialSplitBillItems: SplitBillItem[]
  initialBudgetCaps: BudgetCap[]
}

export function DashboardView({
  user,
  initialCategories,
  initialTransactions,
  initialWallets,
  initialWishlists,
  initialSplitBills,
  initialSplitBillItems,
  initialBudgetCaps,
}: DashboardViewProps) {
  const [viewMode, setViewMode] = useState<"month" | "year">("month")
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [categories] = useState(initialCategories)
  const [transactions, setTransactions] = useState(initialTransactions)
  const [wallets, setWallets] = useState(initialWallets)
  const [wishlists, setWishlists] = useState(initialWishlists)
  const [splitBills, setSplitBills] = useState(initialSplitBills)
  const [splitBillItems, setSplitBillItems] = useState(initialSplitBillItems)
  const [budgetCaps, setBudgetCaps] = useState(initialBudgetCaps)
  const [streak, setStreak] = useState(0)
  const [savingLevel, setSavingLevel] = useState("Bronze Saver")
  const [loading, setLoading] = useState(false)
  const { isPro, loading: planLoading } = usePlanStatus()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [formNonce, setFormNonce] = useState(0)
  const [drawerTab, setDrawerTab] = useState<"manual" | "ocr">("manual")
  const [splitBillOpen, setSplitBillOpen] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)

  const loadPeriod = useCallback(
    async (mode: "month" | "year", periodMonth: number, periodYear: number) => {
      const base =
        mode === "month"
          ? new Date(periodYear, periodMonth, 1)
          : new Date(periodYear, 0, 1)
      const start = mode === "month" ? startOfMonth(base) : startOfYear(base)
      const end = mode === "month" ? endOfMonth(base) : endOfYear(base)

      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .gte("date", format(start, "yyyy-MM-dd"))
        .lte("date", format(end, "yyyy-MM-dd"))
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) {
        toast.error("Gagal memuat transaksi", { description: error.message })
      }
      setTransactions((data as Transaction[]) ?? [])
      setLoading(false)
    },
    []
  )

  const handleViewModeChange = (mode: "month" | "year") => {
    setViewMode(mode)
    loadPeriod(mode, month, year)
  }

  const handlePeriodChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth)
    setYear(newYear)
    loadPeriod(viewMode, newMonth, newYear)
  }

  const refresh = () => loadPeriod(viewMode, month, year)

  const refreshWallets = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("wallets")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at")
    setWallets((data as Wallet[]) ?? [])
  }, [])

  const refreshWishlists = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("wishlists")
      .select("*")
      .order("created_at", { ascending: false })
    setWishlists((data as Wishlist[]) ?? [])
  }, [])

  const refreshSplitBills = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("split_bills")
      .select("*")
      .order("created_at", { ascending: false })
    setSplitBills((data as SplitBill[]) ?? [])
  }, [])

  const refreshSplitBillItems = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("split_bill_items")
      .select("*")
      .order("created_at")
    setSplitBillItems((data as SplitBillItem[]) ?? [])
  }, [])

  const refreshBudgetCaps = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("budget_caps")
      .select("*")
      .order("created_at")
    setBudgetCaps((data as BudgetCap[]) ?? [])
  }, [])

  // Streak check-in: dipanggil sekali saat dashboard dibuka
  useEffect(() => {
    const checkIn = async () => {
      try {
        const res = await fetch("/api/streak", { method: "POST" })
        if (!res.ok) return
        const data = await res.json()
        setStreak(data.streak ?? 0)
        setSavingLevel(data.saving_level ?? "Bronze Saver")
      } catch {
        // Streak bersifat kosmetik, gagal fetch diabaikan
      }
    }
    checkIn()
  }, [])

  const handleOpenAdd = () => {
    setEditing(null)
    setDrawerTab("manual")
    setFormNonce((n) => n + 1)
    setDrawerOpen(true)
  }

  const handleOpenScan = () => {
    setEditing(null)
    setDrawerTab("ocr")
    setFormNonce((n) => n + 1)
    setDrawerOpen(true)
  }

  const handleOpenSplitBill = () => {
    const activeCount = splitBills.filter((b) => b.status === "active").length
    if (canCreateWithinFreeLimit(isPro, activeCount)) {
      setSplitBillOpen(true)
    } else {
      setPaywallOpen(true)
    }
  }

  const handleOpenEdit = (transaction: Transaction) => {
    setEditing(transaction)
    setDrawerTab("manual")
    setFormNonce((n) => n + 1)
    setDrawerOpen(true)
  }

  const handleDelete = async (transaction: Transaction): Promise<boolean> => {
    const supabase = createClient()
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transaction.id)
    if (error) {
      toast.error("Gagal menghapus transaksi", { description: error.message })
      return false
    }
    await refresh()
    return true
  }

  const periodRange = useMemo(() => {
    if (viewMode === "month") {
      const base = new Date(year, month, 1)
      return { start: startOfMonth(base), end: endOfMonth(base) }
    }
    const base = new Date(year, 0, 1)
    return { start: startOfYear(base), end: endOfYear(base) }
  }, [viewMode, month, year])

  const totals = useMemo(() => {
    let income = 0
    let expense = 0
    let incomeCount = 0
    let expenseCount = 0
    for (const t of transactions) {
      if (t.type === "income") {
        income += t.amount
        incomeCount += 1
      } else {
        expense += t.amount
        expenseCount += 1
      }
    }
    return { income, expense, net: income - expense, incomeCount, expenseCount }
  }, [transactions])

  const chartData = useMemo<ChartDatum[]>(() => {
    if (viewMode === "month") {
      const days = eachDayOfInterval({ start: periodRange.start, end: periodRange.end })
      return days.map((day) => {
        const income = transactions
          .filter((t) => t.type === "income" && isSameDay(parseISO(t.date), day))
          .reduce((sum, t) => sum + t.amount, 0)
        const expense = transactions
          .filter((t) => t.type === "expense" && isSameDay(parseISO(t.date), day))
          .reduce((sum, t) => sum + t.amount, 0)
        return { label: format(day, "d"), income, expense }
      })
    }

    const months = eachMonthOfInterval({ start: periodRange.start, end: periodRange.end })
    return months.map((monthDate) => {
      const income = transactions
        .filter((t) => t.type === "income" && isSameMonth(parseISO(t.date), monthDate))
        .reduce((sum, t) => sum + t.amount, 0)
      const expense = transactions
        .filter((t) => t.type === "expense" && isSameMonth(parseISO(t.date), monthDate))
        .reduce((sum, t) => sum + t.amount, 0)
      return { label: format(monthDate, "MMM", { locale: localeID }), income, expense }
    })
  }, [transactions, viewMode, periodRange])

  const donutData = useMemo<DonutDatum[]>(() => {
    const expenses = transactions.filter((t) => t.type === "expense")
    const map = new Map<string, number>()
    for (const t of expenses) {
      const name =
        (t.category_id ? categories.find((c) => c.id === t.category_id)?.name : null) ??
        "Tanpa Kategori"
      map.set(name, (map.get(name) ?? 0) + t.amount)
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [transactions, categories])

  const periodKey = viewMode === "month" ? `${year}-${month}` : `${year}`
  const monthYearKey =
    viewMode === "month"
      ? `${year}-${String(month + 1).padStart(2, "0")}`
      : `${year}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const periodLabel =
    viewMode === "month"
      ? format(new Date(year, month, 1), "MMMM yyyy", { locale: localeID })
      : String(year)

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[#0b0f10]">
      <DashboardHeader user={user} onAddClick={handleOpenAdd} />

      {/* Entrance halus setelah data server selesai difetch (komponen ini
          hanya ter-render begitu page server selesai memuat data) */}
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto w-full max-w-7xl flex-1 space-y-8 overflow-x-clip px-4 pt-8 pb-28 sm:px-6 md:pb-8 lg:px-8"
      >
        <section id="overview" className="space-y-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="font-space text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {getGreeting()}, {(user.name || "").split(" ")[0] || "Kamu"}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                <span>Periode {periodLabel}</span>
                <span className="inline-block size-1 rounded-full bg-slate-500" />
                <span className="rounded border border-[#00f076]/20 bg-[#00f076]/8 px-2 py-0.5 text-xs font-medium text-[#00f076]">
                  Sinkron Otomatis Aktif
                </span>
                {planLoading ? (
                  <span className="h-5 w-16 animate-pulse rounded-full bg-[#1c2225]" />
                ) : isPro ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00f076]/30 bg-[#00f076]/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#00f076]">
                    <span className="size-1.5 animate-pulse rounded-full bg-[#00f076]" />
                    PRO MEMBER
                  </span>
                ) : (
                  <>
                    <span className="rounded-full border border-slate-600 bg-slate-700/40 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-300">
                      FREE TIER
                    </span>
                    <button
                      type="button"
                      onClick={() => setPaywallOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#00f076] transition hover:underline"
                    >
                      <Sparkles className="size-3.5" />
                      Upgrade ke Pro
                    </button>
                  </>
                )}
              </p>
            </div>
            <PeriodNavigation
              viewMode={viewMode}
              month={month}
              year={year}
              onViewModeChange={handleViewModeChange}
              onPeriodChange={handlePeriodChange}
            />
          </div>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 rounded-xl bg-[#00f076] px-4 py-2.5 text-sm font-bold text-[#070a0b] shadow-glow-mint transition hover:bg-[#00dc6c] active:scale-[0.99]"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              Catat Transaksi
            </button>
            <button
              type="button"
              onClick={handleOpenScan}
              className="flex items-center gap-2 rounded-xl border border-[#1c2225] bg-[#101415] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-[#00f076]/40 hover:text-white active:scale-[0.99]"
            >
              <ScanLine className="size-4 text-[#00f076]" />
              Scan Mutasi OCR
            </button>
            <button
              type="button"
              onClick={handleOpenSplitBill}
              className="flex items-center gap-2 rounded-xl border border-[#1c2225] bg-[#101415] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-[#00f076]/40 hover:text-white active:scale-[0.99]"
            >
              <Users className="size-4 text-[#00f076]" />
              Split Bill Baru
            </button>
          </div>
        </section>

        <SummaryCards
          income={totals.income}
          expense={totals.expense}
          net={totals.net}
          incomeCount={totals.incomeCount}
          expenseCount={totals.expenseCount}
          loading={loading}
          periodKey={periodKey}
        />

        <WalletsStrip
          wallets={wallets}
          userId={user.id}
          onWalletsChanged={refreshWallets}
        />

        <SmartInsight
          transactions={transactions}
          categories={categories}
          streak={streak}
          savingLevel={savingLevel}
          isPro={isPro}
          monthLabel={periodLabel}
        />

        <BudgetCapsSection
          caps={budgetCaps.filter((cap) => cap.month_year === monthYearKey)}
          categories={categories}
          transactions={transactions}
          monthYear={monthYearKey}
          userId={user.id}
          onChanged={refreshBudgetCaps}
        />

        <SplitBillSection
          bills={splitBills}
          items={splitBillItems}
          userId={user.id}
          createOpen={splitBillOpen}
          onCreateOpenChange={setSplitBillOpen}
          onChanged={() => {
            refreshSplitBills()
            refreshSplitBillItems()
          }}
        />

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <MainChart
              data={chartData}
              viewMode={viewMode}
              loading={loading}
              hasData={transactions.length > 0}
              periodLabel={periodLabel}
            />
          </div>
          <div className="lg:col-span-5">
            <CategoryBreakdown
              data={donutData}
              totalExpense={totals.expense}
              loading={loading}
            />
          </div>
        </section>

        <WishlistSection
          wishlists={wishlists}
          userId={user.id}
          onWishlistsChanged={refreshWishlists}
          sectionId="wishlist"
        />

        <div id="transaksi">
          <TransactionList
            transactions={transactions}
            categories={categories}
            loading={loading}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        </div>
      </motion.main>

      <MobileBottomNav user={user} onAddClick={handleOpenAdd} />

      <TransactionDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        wallets={wallets}
        onWalletCreated={refreshWallets}
        categories={categories}
        editing={editing}
        formKey={formNonce}
        userId={user.id}
        initialTab={drawerTab}
        onSaved={refresh}
      />

      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  )
}
