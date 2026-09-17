import { createBrowserClient } from "@supabase/ssr"

import {
  applyRememberMePolicy,
  parseDocumentCookies,
  readRememberMeFlag,
  serializeCookie,
  type CookieAttributes,
} from "@/lib/supabase/cookies"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseDocumentCookies()
        },
        setAll(cookiesToSet) {
          const rememberMe = readRememberMeFlag()
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = serializeCookie(
              name,
              value,
              applyRememberMePolicy(
                name,
                options as CookieAttributes | undefined,
                rememberMe
              )
            )
          })
        },
      },
    }
  )
}
