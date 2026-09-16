import type { PostgrestError } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

import { FREE_OCR_LIMIT } from "@/lib/entitlements"
import { createClient } from "@/lib/supabase/server"

interface Subscription {
  status: "free" | "pro"
  ocr_usage_count: number
  ocr_reset_date: string
}

/**
 * Ambil subscription user dan reset kuota OCR bulanan bila sudah kedaluwarsa.
 * Reset dilakukan secara lazy: begitu hari ini melewati ocr_reset_date,
 * counter dikembalikan ke 0 dan reset date digeser 1 bulan ke depan.
 */
async function getSubscriptionWithReset(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, ocr_usage_count, ocr_reset_date")
    .eq("user_id", userId)
    .single()

  if (error || !data) {
    return { subscription: null as Subscription | null, error: error as PostgrestError | null }
  }

  const subscription = data as Subscription
  const today = new Date().toISOString().slice(0, 10)

  // Auto-reset kuota bulanan (lazy reset)
  if (subscription.ocr_reset_date && today > subscription.ocr_reset_date) {
    const nextReset = new Date()
    nextReset.setMonth(nextReset.getMonth() + 1)
    const nextResetDate = nextReset.toISOString().slice(0, 10)

    await supabase
      .from("subscriptions")
      .update({ ocr_usage_count: 0, ocr_reset_date: nextResetDate })
      .eq("user_id", userId)

    subscription.ocr_usage_count = 0
    subscription.ocr_reset_date = nextResetDate
  }

  return { subscription, error: null }
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 })
  }

  const { subscription, error } = await getSubscriptionWithReset(supabase, user.id)
  if (error || !subscription) {
    return NextResponse.json({ error: "SUBSCRIPTION_NOT_FOUND" }, { status: 404 })
  }

  const isPro = subscription.status === "pro"
  const used = subscription.ocr_usage_count

  return NextResponse.json({
    status: subscription.status,
    ocr_limit: isPro ? null : FREE_OCR_LIMIT,
    ocr_used: used,
    ocr_remaining: isPro ? null : Math.max(0, FREE_OCR_LIMIT - used),
    ocr_reset_date: subscription.ocr_reset_date,
  })
}

/**
 * POST /api/ocr
 * Body: { commit?: boolean }
 *
 * - commit kosong/false: hanya cek kuota (dipanggil sebelum scan).
 * - commit true: konsumsi 1 kuota (dipanggil setelah scan sukses).
 *
 * Limitasi dilakukan SERVER-SIDE sehingga tidak bisa dilewati client.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 })
  }

  const { subscription, error } = await getSubscriptionWithReset(supabase, user.id)
  if (error || !subscription) {
    return NextResponse.json({ error: "SUBSCRIPTION_NOT_FOUND" }, { status: 404 })
  }

  const isPro = subscription.status === "pro"

  // Entitlement check: free plan dibatasi FREE_OCR_LIMIT scan per bulan
  if (!isPro && subscription.ocr_usage_count >= FREE_OCR_LIMIT) {
    return NextResponse.json(
      {
        error: "LIMIT_REACHED",
        message: `Kuota OCR bulan ini habis (${FREE_OCR_LIMIT}/${FREE_OCR_LIMIT}). Upgrade ke Pro untuk unlimited scan!`,
      },
      { status: 403 }
    )
  }

  // Validasi body secara ketat: hanya menerima { commit?: boolean }.
  // Body kosong diperbolehkan (check-only). Bentuk lain ditolak 400.
  let commit = false
  try {
    const text = await request.text()
    if (text.trim().length > 0) {
      const body: unknown = JSON.parse(text)
      if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 })
      }
      const { commit: rawCommit } = body as { commit?: unknown }
      if (rawCommit !== undefined && typeof rawCommit !== "boolean") {
        return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 })
      }
      commit = rawCommit === true
    }
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 })
  }

  if (!commit) {
    return NextResponse.json({
      ok: true,
      ocr_used: subscription.ocr_usage_count,
      ocr_remaining: isPro
        ? null
        : Math.max(0, FREE_OCR_LIMIT - subscription.ocr_usage_count),
    })
  }

  // Commit: konsumsi 1 kuota scan (dipanggil setelah scan sukses)
  const { error: quotaError } = await supabase
    .from("subscriptions")
    .update({ ocr_usage_count: subscription.ocr_usage_count + 1 })
    .eq("user_id", user.id)

  if (quotaError) {
    return NextResponse.json({ error: "QUOTA_UPDATE_FAILED" }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    ocr_used: subscription.ocr_usage_count + 1,
    ocr_remaining: isPro
      ? null
      : Math.max(0, FREE_OCR_LIMIT - (subscription.ocr_usage_count + 1)),
  })
}
