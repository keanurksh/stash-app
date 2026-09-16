import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith("/admin")
  const isProtected = pathname.startsWith("/dashboard")
  const isLoginPage = pathname === "/login"

  // Admin routes: hanya role 'admin' yang boleh lewat
  if (isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      url.search = ""
      return NextResponse.redirect(url)
    }

    return response
  }

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login"],
}
