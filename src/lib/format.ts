const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat("id-ID")

export function formatIDR(amount: number): string {
  return idrFormatter.format(amount)
}

export function formatNumber(amount: number): string {
  return numberFormatter.format(amount)
}

export function formatCompactIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount)
}

export function parseDigitsToNumber(input: string): number {
  const digits = input.replace(/\D/g, "")
  return digits ? parseInt(digits, 10) : 0
}

export function formatAmountInput(input: string): string {
  const value = parseDigitsToNumber(input)
  return value ? numberFormatter.format(value) : ""
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
