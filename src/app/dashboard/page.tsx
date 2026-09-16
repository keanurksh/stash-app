import { format, endOfMonth, startOfMonth } from "date-fns"
import { redirect } from "next/navigation"

import { DashboardView } from "@/components/dashboard/dashboard-view"
import { createClient } from "@/lib/supabase/server"
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

export const metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const today = new Date()
  const start = format(startOfMonth(today), "yyyy-MM-dd")
  const end = format(endOfMonth(today), "yyyy-MM-dd")

  const [categoriesResult, transactionsResult, walletsResult, wishlistsResult, splitBillsResult, splitBillItemsResult, budgetCapsResult] =
    await Promise.all([
      supabase.from("categories").select("*").order("type").order("name"),
      supabase
        .from("transactions")
        .select("*")
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("wallets")
        .select("*")
        .order("is_default", { ascending: false })
        .order("created_at"),
      supabase
        .from("wishlists")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("split_bills")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("split_bill_items").select("*").order("created_at"),
      supabase.from("budget_caps").select("*").order("created_at"),
    ])

  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>
  const dashboardUser: DashboardUser = {
    id: user.id,
    name:
      meta.full_name ??
      meta.name ??
      user.email?.split("@")[0] ??
      "Pengguna",
    email: user.email ?? "",
    avatarUrl: meta.avatar_url ?? meta.picture ?? null,
  }

  return (
    <DashboardView
      user={dashboardUser}
      initialCategories={(categoriesResult.data as Category[]) ?? []}
      initialTransactions={(transactionsResult.data as Transaction[]) ?? []}
      initialWallets={(walletsResult.data as Wallet[]) ?? []}
      initialWishlists={(wishlistsResult.data as Wishlist[]) ?? []}
      initialSplitBills={(splitBillsResult.data as SplitBill[]) ?? []}
      initialSplitBillItems={(splitBillItemsResult.data as SplitBillItem[]) ?? []}
      initialBudgetCaps={(budgetCapsResult.data as BudgetCap[]) ?? []}
    />
  )
}
