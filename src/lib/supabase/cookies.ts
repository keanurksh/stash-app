/**
 * Shared cookie helpers for the "Remember me" feature.
 *
 * Supabase menulis auth cookie sebagai persistent cookie (maxAge ~400 hari).
 * Saat user login TANPA mencentang "Remember me", kita menulis flag cookie
 * `stash-remember-me=0` dan menghapus atribut kedaluwarsa dari auth cookie
 * sehingga menjadi session cookie yang otomatis dibuang browser saat ditutup.
 * Tab baru dan reload dalam sesi browser yang sama tetap berfungsi normal.
 */

export const REMEMBER_ME_COOKIE = "stash-remember-me"

/** True untuk cookie token auth Supabase (termasuk chunk .0, .1, ...). */
export function isAuthTokenCookie(name: string): boolean {
  return /^sb-.*-auth-token/.test(name)
}

export interface CookieAttributes {
  maxAge?: number
  expires?: Date
  path?: string
  domain?: string
  sameSite?: "lax" | "strict" | "none"
  secure?: boolean
}

/**
 * Jika remember-me dimatikan, buang atribut kedaluwarsa dari auth cookie
 * agar menjadi session cookie. Cookie lain tidak disentuh.
 */
export function applyRememberMePolicy(
  name: string,
  options: CookieAttributes | undefined,
  rememberMe: boolean
): CookieAttributes | undefined {
  if (rememberMe || !isAuthTokenCookie(name) || !options) return options
  const { maxAge: _maxAge, expires: _expires, ...rest } = options
  void _maxAge
  void _expires
  return rest
}

export function serializeCookie(
  name: string,
  value: string,
  options?: CookieAttributes
): string {
  let str = `${name}=${value}`
  if (options?.maxAge) str += `; Max-Age=${options.maxAge}`
  if (options?.expires) str += `; Expires=${options.expires.toUTCString()}`
  if (options?.path) str += `; Path=${options.path}`
  if (options?.domain) str += `; Domain=${options.domain}`
  if (options?.sameSite) str += `; SameSite=${options.sameSite}`
  if (options?.secure) str += `; Secure`
  return str
}

export function parseDocumentCookies(): { name: string; value: string }[] {
  if (typeof document === "undefined") return []
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const eq = part.indexOf("=")
      if (eq === -1) return { name: part, value: "" }
      return {
        name: part.slice(0, eq).trim(),
        value: decodeURIComponent(part.slice(eq + 1).trim()),
      }
    })
}

export function readRememberMeFlag(): boolean {
  if (typeof document === "undefined") return true
  const found = parseDocumentCookies().find(
    (c) => c.name === REMEMBER_ME_COOKIE
  )
  return found?.value !== "0"
}

/** Tulis flag remember-me sebagai persistent cookie (1 tahun). */
export function writeRememberMeFlag(rememberMe: boolean) {
  if (typeof document === "undefined") return
  document.cookie = serializeCookie(REMEMBER_ME_COOKIE, rememberMe ? "1" : "0", {
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
    sameSite: "lax",
  })
}
