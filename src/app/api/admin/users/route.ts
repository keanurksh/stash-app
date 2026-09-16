import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { admin: null, supabase, error: NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return { admin: null, supabase, error: NextResponse.json({ error: "FORBIDDEN" }, { status: 403 }) }
  }

  return { admin: user, supabase, error: null }
}

/**
 * GET /api/admin/users
 * Daftar semua user + status subscription (untuk admin panel).
 */
export async function GET() {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .order("id")

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 })
  }

  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const emailById = new Map(
    (authUsers?.users ?? []).map((u) => [u.id, u.email ?? ""])
  )

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("user_id, status, ocr_usage_count, current_streak, saving_level")

  const subByUser = new Map(
    (subscriptions ?? []).map((s) => [s.user_id, s])
  )

  const rows = users.map((u) => {
    const sub = subByUser.get(u.id)
    return {
      id: u.id,
      email: emailById.get(u.id) ?? "(tanpa email)",
      full_name: u.full_name,
      role: u.role,
      plan: sub?.status ?? "free",
      ocr_used: sub?.ocr_usage_count ?? 0,
      streak: sub?.current_streak ?? 0,
      saving_level: sub?.saving_level ?? "-",
    }
  })

  return NextResponse.json({ users: rows })
}

/**
 * PATCH /api/admin/users
 * Body: { userId, plan: "free" | "pro" }
 * Toggle 1-klik status plan user.
 */
export async function PATCH(request: Request) {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  let body: { userId?: string; plan?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 })
  }

  const { userId, plan } = body
  if (!userId || (plan !== "free" && plan !== "pro")) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 })
  }

  const update: Record<string, unknown> = {
    status: plan,
    updated_at: new Date().toISOString(),
  }
  if (plan === "pro") {
    update.plan_started_at = new Date().toISOString()
  } else {
    update.plan_started_at = null
  }

  const { error: updateError } = await supabase
    .from("subscriptions")
    .update(update)
    .eq("user_id", userId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, userId, plan })
}
