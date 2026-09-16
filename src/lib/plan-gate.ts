import { useEffect, useState } from "react"

export interface PlanStatus {
  isPro: boolean
  loading: boolean
  refresh: () => Promise<void>
}

/** Ambil status langganan user untuk pre-check fitur Pro di client. */
export function usePlanStatus(): PlanStatus {
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const res = await fetch("/api/ocr")
      if (!res.ok) return
      const data = await res.json()
      setIsPro(data.status === "pro")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return { isPro, loading, refresh }
}

/**
 * Cek apakah error dari Supabase adalah pelanggaran limit free plan
 * (trigger WALLET_LIMIT_REACHED / WISHLIST_LIMIT_REACHED).
 * Jika ya, tampilkan PaywallModal.
 */
export function isPlanLimitError(error: unknown): boolean {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : ""
  return (
    message.includes("WALLET_LIMIT_REACHED") ||
    message.includes("WISHLIST_LIMIT_REACHED")
  )
}

/**
 * Pre-check sebelum insert wallet/wishlist dari client.
 * Return true jika boleh lanjut, false jika harus menampilkan paywall.
 */
export function canCreateWithinFreeLimit(
  isPro: boolean,
  currentCount: number
): boolean {
  if (isPro) return true
  return currentCount < 1
}
