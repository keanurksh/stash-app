import Link from "next/link"
import { Home, LayoutDashboard, SearchX } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0f10] px-4 text-center">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-[#00f076]/8 blur-[120px]" />

      <div className="relative flex flex-col items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-[#1c2225] bg-[#14191b]">
          <SearchX className="size-7 text-[#00f076]" />
        </div>

        <p className="font-mono text-sm font-semibold tracking-widest text-[#00f076]">
          404
        </p>
        <h1 className="font-space text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Halaman tidak ditemukan
        </h1>
        <p className="max-w-[320px] text-sm text-slate-400">
          Alamat yang kamu tuju sudah dipindah atau tidak pernah ada. Yuk
          balik ke tempat yang aman.
        </p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#00f076] px-5 py-2.5 text-sm font-bold text-[#070a0b] shadow-glow-mint transition hover:bg-[#00dc6c] active:scale-[0.99]"
          >
            <LayoutDashboard className="size-4" />
            Kembali ke Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-[#1c2225] bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-[#00f076]/40 hover:text-white"
          >
            <Home className="size-4" />
            Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  )
}
