"use client"

import { useCallback, useEffect, useState } from "react"

import { FREE_OCR_LIMIT } from "@/lib/entitlements"

export interface OcrQuota {
  status: "free" | "pro"
  ocrLimit: number | null
  ocrUsed: number
  ocrRemaining: number | null
  ocrResetDate: string | null
  loading: boolean
  /**
   * Cek kuota (commit=false) sebelum scan, atau konsumsi kuota
   * (commit=true) setelah scan sukses. Return false berarti limit habis.
   */
  consumeScan: (commit: boolean) => Promise<boolean>
  refresh: () => Promise<void>
}

export function useOcrQuota(): OcrQuota {
  const [status, setStatus] = useState<"free" | "pro">("free")
  const [ocrUsed, setOcrUsed] = useState(0)
  const [ocrResetDate, setOcrResetDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/ocr")
      if (!res.ok) return
      const data = await res.json()
      setStatus(data.status)
      setOcrUsed(data.ocr_used ?? 0)
      setOcrResetDate(data.ocr_reset_date ?? null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const consumeScan = useCallback(
    async (commit: boolean): Promise<boolean> => {
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commit }),
      })

      if (res.status === 403) {
        return false
      }
      if (!res.ok) {
        throw new Error("Gagal memeriksa kuota OCR")
      }

      const data = await res.json()
      setOcrUsed(data.ocr_used ?? ocrUsed)
      return true
    },
    [ocrUsed]
  )

  const isPro = status === "pro"
  const ocrRemaining = isPro ? null : Math.max(0, FREE_OCR_LIMIT - ocrUsed)

  return {
    status,
    ocrLimit: isPro ? null : FREE_OCR_LIMIT,
    ocrUsed,
    ocrRemaining,
    ocrResetDate,
    loading,
    consumeScan,
    refresh,
  }
}
