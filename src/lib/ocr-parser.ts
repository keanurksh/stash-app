import type { TransactionType } from "@/types"

export interface OcrParseResult {
  amount: number | null
  date: string | null // yyyy-MM-dd
  type: TransactionType
}

const MONTHS: Record<string, number> = {
  jan: 1, januari: 1, january: 1,
  feb: 2, februari: 2, peb: 2, february: 2,
  mar: 3, maret: 3, march: 3,
  apr: 4, april: 4,
  mei: 5, may: 5,
  jun: 6, juni: 6, june: 6,
  jul: 7, juli: 7, july: 7,
  agu: 8, agustus: 8, aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  okt: 10, oktober: 10, oct: 10, october: 10,
  nov: 11, november: 11,
  des: 12, desember: 12, dec: 12, december: 12,
}

function normalizeNumericToken(token: string): number | null {
  // Trim leading/trailing separators (e.g. "25.000." from a sentence)
  const cleaned = token
    .replace(/[^\d.,]/g, "")
    .replace(/^[.,]+|[.,]+$/g, "")
  if (!cleaned) return null

  // Indonesian format: 1.250.000 or 1.250.000,50 (dot as thousand sep)
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/\./g, "").replace(",", "."))
  }
  // English format: 1,250,000 (comma as thousand sep)
  if (/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/,/g, ""))
  }
  // Plain digits
  if (/^\d+$/.test(cleaned)) {
    return parseInt(cleaned, 10)
  }
  return null
}

// Lines containing these are reference/ID numbers, not amounts
const ID_KEYWORDS = [
  "rrn",
  "ref",
  "reference",
  "order id",
  "orderid",
  "order no",
  "invoice",
  "serial",
  "session",
  "trx id",
  "txn",
  "transaction id",
  "id transaksi",
  "no transaksi",
  "nomor transaksi",
  "no. transaksi",
  "batch",
  "stan",
  "trace",
]

// Lines containing these are balances/rewards, not the transaction amount
const NEGATIVE_KEYWORDS = [
  "saldo",
  "sisa",
  "balance",
  "available",
  "cashback",
  "poin",
  "point",
  "reward",
  "limit",
  "kredit limit",
]

// Lines containing these very likely state the transaction amount
const AMOUNT_KEYWORDS = [
  "total",
  "jumlah",
  "nominal",
  "amount",
  "nilai",
  "nilai transaksi",
  "pembayaran",
  "bayar",
  "payment",
  "transfer",
  "kirim",
  "top up",
  "topup",
]

interface AmountCandidate {
  value: number
  score: number
}

function extractAmount(text: string): number | null {
  const lines = text.split(/\r?\n/).filter((line) => line.trim())
  const candidates: AmountCandidate[] = []
  const totalLines = lines.length

  lines.forEach((line, index) => {
    const lower = line.toLowerCase()
    const hasIdKeyword = ID_KEYWORDS.some((k) => lower.includes(k))
    const hasNegative = NEGATIVE_KEYWORDS.some((k) => lower.includes(k))
    const hasTotal = lower.includes("total")
    const hasAmountKeyword = AMOUNT_KEYWORDS.some((k) => lower.includes(k))
    // Amount usually appears near the top of e-wallet / m-banking receipts
    const positionBonus =
      totalLines > 1 ? Math.round((1 - index / (totalLines - 1)) * 20) : 10

    const addCandidate = (raw: string, hasCurrencyPrefix: boolean) => {
      const value = normalizeNumericToken(raw)
      if (!value || value <= 0) return

      let score = positionBonus
      if (hasCurrencyPrefix) score += 100
      // "Total" beats "Nominal" when the receipt lists a separate admin fee
      if (hasTotal) score += 70
      else if (hasAmountKeyword) score += 50
      if (hasNegative) score -= 120

      const compact = raw.replace(/[^\d]/g, "")
      if (hasIdKeyword) {
        // A currency-prefixed value on an ID line is still suspicious,
        // but a bare number on an ID line (RRN, order ID, ...) is almost
        // certainly not an amount.
        score += hasCurrencyPrefix ? -40 : -1000
      }
      // Long unseparated digit runs (>= 8 digits) are IDs more often than amounts
      if (!hasCurrencyPrefix && !/[.,]/.test(raw) && compact.length >= 8) {
        score -= 500
      }

      candidates.push({ value, score })
    }

    // 1) Currency-prefixed amounts (Rp / IDR)
    for (const match of line.matchAll(/(?:rp|idr)\s*\.?\s*([\d.,]+)/gi)) {
      addCandidate(match[1], true)
    }
    // 2) Grouped numbers with thousand separators
    for (const match of line.matchAll(/\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{1,2})?/g)) {
      addCandidate(match[0], false)
    }
    // 3) Plain digit runs as last-resort fallback
    for (const match of line.matchAll(/\b(\d{4,12})\b/g)) {
      addCandidate(match[1], false)
    }
  })

  if (candidates.length === 0) return null

  candidates.sort((a, b) => b.score - a.score || b.value - a.value)
  return candidates[0].value
}

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

function extractDate(text: string): string | null {
  const now = new Date()
  const lower = text.toLowerCase()

  // Format: 25/08/2026, 25-08-26, 25.08.2026
  const numeric = lower.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/)
  if (numeric) {
    let day = parseInt(numeric[1], 10)
    let month = parseInt(numeric[2], 10)
    let year = parseInt(numeric[3], 10)
    if (year < 100) year += 2000

    // Heuristic: Indonesian screenshots usually put day first,
    // but if the first number is > 12 and the second is <= 12 keep as is.
    if (day > 12 && month <= 12) {
      // day-first, already correct
    } else if (month > 12 && day <= 12) {
      const tmp = day
      day = month
      month = tmp
    }

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2100) {
      return `${year}-${pad(month)}-${pad(day)}`
    }
  }

  // Format: 25 Agu 2026 / 25 Aug 2026 / 25 Agustus 2026
  const named = lower.match(
    /(\d{1,2})\s+([a-z]{3,9})\.?\s+(\d{2,4})/
  )
  if (named) {
    const day = parseInt(named[1], 10)
    const month = MONTHS[named[2]]
    let year = parseInt(named[3], 10)
    if (year < 100) year += 2000
    if (month && day >= 1 && day <= 31 && year >= 2000 && year <= 2100) {
      return `${year}-${pad(month)}-${pad(day)}`
    }
  }

  // Fallback: year-month-day in text (2026-08-25)
  const iso = lower.match(/(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/)
  if (iso) {
    const year = parseInt(iso[1], 10)
    const month = parseInt(iso[2], 10)
    const day = parseInt(iso[3], 10)
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2100) {
      return `${year}-${pad(month)}-${pad(day)}`
    }
  }

  void now
  return null
}

function detectType(text: string): TransactionType {
  const lower = text.toLowerCase()
  const incomeKeywords = [
    "pemasukan",
    "top up",
    "topup",
    "top-up",
    "transfer masuk",
    "dana masuk",
    "diterima",
    "received",
    "bonus",
    "gaji",
    "salary",
    "refund",
    "income",
    "saldo masuk",
  ]
  return incomeKeywords.some((keyword) => lower.includes(keyword))
    ? "income"
    : "expense"
}

export function parseOcrText(text: string): OcrParseResult {
  return {
    amount: extractAmount(text),
    date: extractDate(text),
    type: detectType(text),
  }
}
