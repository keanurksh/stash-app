import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import {
  REMEMBER_ME_COOKIE,
  applyRememberMePolicy,
  type CookieAttributes,
} from "@/lib/supabase/cookies"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            const rememberMe =
              cookieStore.get(REMEMBER_ME_COOKIE)?.value !== "0"
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(
                name,
                value,
                applyRememberMePolicy(
                  name,
                  options as CookieAttributes | undefined,
                  rememberMe
                ) as typeof options
              )
            )
          } catch {
            // Called from a Server Component, safe to ignore because the
            // proxy refreshes sessions before they reach here.
          }
        },
      },
    }
  )
}
