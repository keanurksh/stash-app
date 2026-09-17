import Link from "next/link"

import { GoogleIcon } from "@/components/landing/google-icon"

export function BottomCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 [content-visibility:auto] [contain-intrinsic-size:auto_550px] md:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-[#00f076]/40 bg-[#181c1d] p-8 text-center sm:p-14">
        <div className="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-[#00f076]/20 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3b4b3c]/30 bg-[#1c2021] px-3 py-1 font-space text-[10px] font-bold tracking-[0.06em] text-[#bacbb8]">
            <span>100% Free</span>
            <span className="size-1 rounded-full bg-[#b2ffbe]" />
            <span>Tanpa biaya tersembunyi</span>
          </span>
          <h2 className="font-space text-[38px] leading-[44px] font-bold tracking-[-0.02em] text-white md:text-[56px] md:leading-[64px] md:tracking-[-0.03em]">
            Kendalikan Finansial Kamu Mulai Hari Ini.
          </h2>
          <p className="mx-auto max-w-xl font-jakarta text-[15px] leading-[22px] text-[#bacbb8] md:text-[18px] md:leading-[28px]">
            Bergabung bersama ribuan pengguna aktif yang mengelola anggaran,
            tabungan, dan patungan harian dengan rapi.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-8 py-4 font-space text-sm font-semibold tracking-[0.02em] font-bold text-[#0b0f10] shadow-md transition-all duration-150 hover:bg-[#e0e3e4] active:scale-95 sm:w-auto"
            >
              <GoogleIcon className="size-5" />
              Daftar Cepat dengan Google
            </Link>
          </div>
          <p className="font-space text-xs text-[#849584]">
            Aman dan terenkripsi sesuai standar ISO/IEC 27001 dan Google
            Identity.
          </p>
        </div>
      </div>
    </section>
  )
}
