import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

function savingLevelFor(streak: number): string {
  if (streak >= 30) return "Diamond Saver"
  if (streak >= 14) return "Gold Saver"
  if (streak >= 7) return "Silver Saver"
  return "Bronze Saver"
}

function todayISO(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

function yesterdayISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/**
 * POST /api/streak
 * Dipanggil saat user membuka dashboard. Menghitung streak kunjungan harian:
 * - Sudah check-in hari ini: streak tetap.
 * - Terakhir aktif kemarin: streak +1.
 * - Terakhir aktif lebih lama: streak reset ke 1.
 * Level tabungan otomatis mengikuti tier streak.
 */
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("current_streak, last_active_date, status")
    .eq("user_id", user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "SUBSCRIPTION_NOT_FOUND" }, { status: 404 })
  }

  const today = todayISO()
  let streak = data.current_streak ?? 0

  if (data.last_active_date !== today) {
    streak =
      data.last_active_date === yesterdayISO() ? streak + 1 : 1

    await supabase
      .from("subscriptions")
      .update({
        current_streak: streak,
        last_active_date: today,
        saving_level: savingLevelFor(streak),
      })
      .eq("user_id", user.id)
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("saving_level")
    .eq("user_id", user.id)
    .single()

  return NextResponse.json({
    streak,
    saving_level: sub?.saving_level ?? savingLevelFor(streak),
  })
}
