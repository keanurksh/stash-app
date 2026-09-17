import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface AuthShellProps {
  children: React.ReactNode
}

/**
 * Split-screen auth layout: banner visual emerald di kiri (desktop saja),
 * formulir di kanan. Satu kolom penuh di mobile tanpa horizontal overflow.
 */
export function AuthShell({ children }: AuthShellProps) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#0c1012] p-4 font-space text-zinc-100 antialiased selection:bg-[#00f076] selection:text-black sm:p-6"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(0, 240, 118, 0.05) 0%, transparent 60%), radial-gradient(circle at 85% 90%, rgba(0, 240, 118, 0.02) 0%, transparent 40%)",
      }}
    >
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#111517] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] sm:rounded-3xl lg:grid-cols-2">
        {/* Visual banner — desktop only */}
        <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-10">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-[#00f076]/25 via-[#12544f] to-[#0c1012]"
          />
          <div
            aria-hidden="true"
            className="absolute -top-24 -left-24 size-72 animate-pulse rounded-full bg-[#00f076]/20 blur-[100px]"
          />
          <div
            aria-hidden="true"
            className="absolute -right-20 -bottom-20 size-80 rounded-full bg-[#00f076]/10 blur-[110px]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage:
                "radial-gradient(ellipse 90% 70% at 50% 40%, black 30%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 90% 70% at 50% 40%, black 30%, transparent 75%)",
            }}
          />

          <div className="relative flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Stash"
              width={36}
              height={36}
              className="size-9 rounded-xl"
              priority
            />
            <span className="font-space text-xl font-bold tracking-tight text-white">
              Stash
            </span>
          </div>

          <div className="relative">
            <p className="font-space text-3xl leading-tight font-bold tracking-tight text-white">
              Automated Expense Tracker for Gen Z
            </p>
            <p className="mt-3 max-w-sm font-jakarta text-sm leading-relaxed text-white/70">
              Scan receipts in seconds, split bills with friends, and watch
              your money habits come alive in real time.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {["A", "B", "C"].map((letter) => (
                  <span
                    key={letter}
                    aria-hidden="true"
                    className="flex size-8 items-center justify-center rounded-full border-2 border-[#0c2b1d] bg-[#00f076]/90 font-space text-xs font-bold text-[#070a0b]"
                  >
                    {letter}
                  </span>
                ))}
              </div>
              <p className="font-jakarta text-xs text-white/70">
                Join thousands tracking smarter every day
              </p>
            </div>
          </div>

          <p className="relative font-jakarta text-xs text-white/50">
            Free forever plan. No credit card required.
          </p>
        </div>

        {/* Form side */}
        <div className="relative flex min-w-0 flex-col bg-gradient-to-b from-[rgba(24,30,34,0.88)] to-[rgba(18,23,26,0.94)] p-6 sm:p-10">
          <Link
            href="/"
            className="group mb-6 inline-flex w-fit items-center gap-2 text-xs font-medium text-zinc-400 transition-colors duration-150 hover:text-white"
          >
            <ArrowLeft className="size-4 text-zinc-500 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:text-[#00f076]" />
            <span>Back</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  )
}
