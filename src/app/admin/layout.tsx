import { redirect } from "next/navigation"
import { ShieldCheck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { BrandLogo } from "@/components/brand-logo"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Admin",
}

/**
 * Verifikasi ganda di sisi server: middleware sudah memfilter,
 * tapi layout ini memvalidasi ulang langsung dari database
 * untuk mencegah bypass (defense in depth).
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/admin")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#0b0f10] text-[#e0e3e4] antialiased selection:bg-[#00f076] selection:text-[#070a0b]">
      <header className="sticky top-0 z-40 border-b border-[#1c2225]/80 bg-[#0b0f10]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BrandLogo
              defaultHref="/dashboard"
              textClassName="text-white"
              icon={
                <Image
                  src="/logo.png"
                  alt="Stash"
                  width={32}
                  height={32}
                  className="size-8 rounded-lg transition-transform duration-150 group-hover:scale-105"
                  priority
                />
              }
            />
            <span className="flex items-center gap-1 rounded-full border border-[#00f076]/30 bg-[#00f076]/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#00f076]">
              <ShieldCheck className="size-3" />
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-slate-400 sm:inline">
              {profile.full_name ?? user.email}
            </span>
            <Link
              href="/dashboard"
              className="rounded-xl border border-[#3b4b3c]/40 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-[#00f076]/40 hover:text-white"
            >
              Ke Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
