export type TransactionType = "income" | "expense"

export interface Category {
  id: string
  name: string
  type: TransactionType
  icon: string | null
  is_default: boolean | null
}

export interface Transaction {
  id: string
  user_id: string
  category_id: string | null
  wallet_id?: string | null
  amount: number
  type: TransactionType
  date: string
  notes: string | null
  created_at: string
}

export type WalletType = "bank" | "ewallet" | "cash"

export interface Wallet {
  id: string
  user_id: string
  name: string
  type: WalletType
  balance: number
  is_default: boolean
  created_at: string
}

export interface Wishlist {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  status: "active" | "achieved" | "archived"
  deadline: string | null
  created_at: string
}

export interface SplitBill {
  id: string
  user_id: string
  title: string
  total_amount: number
  status: "active" | "completed"
  created_at: string
}

export interface SplitBillItem {
  id: string
  split_bill_id: string
  friend_name: string
  item_description: string | null
  amount: number
  is_paid: boolean
  updated_at: string
}

export interface BudgetCap {
  id: string
  user_id: string
  category_id: string
  target_amount: number
  month_year: string
  created_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  updated_at: string
}

export interface DashboardUser {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}
