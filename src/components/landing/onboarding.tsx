import Link from "next/link"
import { ArrowRight, CircleCheck, ShieldCheck } from "lucide-react"

const STEPS = [
  {
    number: "01",
    title: "Klik 'Lanjutkan dengan Google'",
    description:
      "Tanpa perlu mengingat password baru atau verifikasi email manual yang lambat. Akses instan dan aman.",
    footer: "Google OAuth 2.0 Certified",
  },
  {
    number: "02",
    title: "Input Transaksi Pertamamu",
    description:
      "Catat manual dalam hitungan detik, atau upload screenshot mutasi GoPay, OVO, ShopeePay, dan m-banking untuk terisi otomatis.",
    footer: "OCR Screenshot Parser",
  },
  {
    number: "03",
    title: "Dashboard Siap Digunakan",
    description:
      "Lihat ringkasan saldo, arus kas harian, dan breakdown kategori pengeluaran dalam sekali pandang.",
    footer: "Langsung Mulai",
  },
]

export function Onboarding() {
  return (
    <section
      id="onboarding"
      className="relative border-y border-[#3b4b3c]/30 bg-[#181c1d]/40 py-20 [content-visibility:auto] [contain-intrinsic-size:auto_700px]"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto mb-16 max-w-3xl space-y-3 text-center">
          <h2 className="font-space text-[26px] leading-8 font-bold tracking-[-0.01em] text-white md:text-[32px] md:leading-10 md:tracking-[-0.02em]">
            Setup selesai dalam hitungan detik.
          </h2>
          <p className="mx-auto mt-2 max-w-xl font-jakarta text-[15px] leading-[22px] text-[#bacbb8]">
            Cukup otorisasi dengan akun Google kamu untuk langsung mengelola
            keuangan secara teratur.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="group relative flex flex-col rounded-2xl border border-[#3b4b3c]/30 bg-[#181c1d] p-6 transition-colors hover:border-[#00f076]/40"
            >
              <div className="mb-4 font-space text-[32px] leading-10 font-bold text-[#b2ffbe] opacity-40 transition-opacity group-hover:opacity-100">
                {step.number}
              </div>
              <h4 className="mb-2 font-space text-xl leading-7 font-semibold text-white">
                {step.title}
              </h4>
              <p className="font-jakarta text-[13px] leading-[18px] text-[#bacbb8]">
                {step.description}
              </p>
              <div className="mt-6 flex items-center gap-2 border-t border-[#3b4b3c]/20 pt-4 text-xs text-[#849584]">
                <CircleCheck className="size-3.5 text-[#00f076]" />
                {step.footer}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#3b4b3c]/40 bg-[#0b0f10] p-6 sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#1c2021] text-[#00f076]">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h5 className="font-space text-sm font-bold text-white">
                Privasi Data Finansialmu Terjamin 100%
              </h5>
              <p className="mt-0.5 font-jakarta text-[13px] leading-[18px] text-[#bacbb8]">
                Kami tidak pernah meminta atau menyimpan kredensial login
                perbankan, kata sandi, maupun PIN transaksi pribadi kamu.
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="flex shrink-0 items-center gap-1 font-space text-xs font-semibold tracking-[0.04em] text-[#b2ffbe] hover:underline"
          >
            Mulai Sekarang
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
