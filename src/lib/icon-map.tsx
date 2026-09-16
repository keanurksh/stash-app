import {
  Banknote,
  Car,
  CreditCard,
  Film,
  HeartPulse,
  Laptop,
  Plus,
  ShoppingBag,
  TrendingUp,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  Banknote,
  Car,
  CreditCard,
  Film,
  HeartPulse,
  Laptop,
  Plus,
  ShoppingBag,
  TrendingUp,
  Utensils,
  Wallet,
}

export function getCategoryIcon(icon: string | null | undefined): LucideIcon {
  if (!icon) return Wallet
  return iconMap[icon] ?? Wallet
}

export function CategoryIcon({
  name,
  className,
}: {
  name?: string | null
  className?: string
}) {
  const Icon = iconMap[name ?? ""] ?? Wallet
  return <Icon className={className} />
}
