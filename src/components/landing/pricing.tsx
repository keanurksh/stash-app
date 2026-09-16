"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { ArrowRight, CheckCheck, ScanLine, Sparkles, Target, Users, LineChart } from "lucide-react"
import { motion } from "framer-motion"
import NumberFlow from "@number-flow/react"

import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PRO_PRICING } from "@/lib/entitlements"
import { cn } from "@/lib/utils"

const numberFlowFormat = {
  style: "currency" as const,
  currency: "IDR",
  maximumFractionDigits: 0,
}

const PLANS = [
  {
    name: "Free",
    description:
      "Cocok buat mulai bangun kebiasaan nyatat tanpa biaya sedikit pun.",
    price: 0,
    yearlyPrice: 0,
    buttonText: "Mulai Gratis",
    popular: false,
    features: [
      { text: "7x OCR Scan per bulan", icon: <ScanLine size={20} /> },
      { text: "1 Dompet (e-wallet/bank)", icon: <Users size={20} /> },
      { text: "1 Target Wishlist aktif", icon: <Target size={20} /> },
    ],
    includes: [
      "Free includes:",
      "Pencatatan transaksi tanpa batas",
      "Grafik arus kas harian & bulanan",
      "Riwayat lintas bulan & tahun",
      "Breakdown kategori otomatis",
    ],
  },
  {
    name: "Pro",
    description:
      "Semua fitur premium tanpa batas untuk kamu yang serius kelola uang.",
    price: PRO_PRICING.monthly,
    yearlyPrice: PRO_PRICING.yearly,
    buttonText: "Upgrade ke Pro",
    popular: true,
    features: [
      { text: "Unlimited OCR Scan", icon: <ScanLine size={20} /> },
      { text: "Multi-Wallet (BCA, GoPay, OVO, dll)", icon: <Users size={20} /> },
      { text: "Unlimited Wishlist Target", icon: <Target size={20} /> },
      { text: "Export Data CSV/Excel", icon: <LineChart size={20} /> },
    ],
    includes: [
      "Everything in Free, plus:",
      "Unlimited Pos Anggaran",
      "Smart Insight real-time penuh",
      "Split Bill tanpa batas",
      "Prioritas fitur baru",
    ],
  },
]

const PricingSwitch = ({
  isYearly,
  onChange,
  className,
}: {
  isYearly: boolean
  onChange: (yearly: boolean) => void
  className?: string
}) => {
  return (
    <div className={cn("flex w-fit", className)}>
      <div className="relative flex rounded-xl border border-[#1c2225] bg-[#0b0f10] p-1">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "relative z-10 h-11 w-fit cursor-pointer rounded-lg px-4 py-1.5 font-space text-sm font-semibold transition-colors sm:px-5",
            !isYearly ? "text-[#070a0b]" : "text-slate-400 hover:text-white"
          )}
        >
          {!isYearly ? (
            <motion.span
              layoutId="pricing-switch"
              className="absolute left-0 top-0 h-full w-full rounded-lg border border-[#00f076]/60 bg-gradient-to-t from-[#00b85a] via-[#00f076] to-[#4edea3] shadow-glow-mint"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          ) : null}
          <span className="relative">Bulanan</span>
        </button>

        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "relative z-10 flex h-11 w-fit shrink-0 cursor-pointer items-center gap-2 rounded-lg px-4 py-1.5 font-space text-sm font-semibold transition-colors sm:px-5",
            isYearly ? "text-[#070a0b]" : "text-slate-400 hover:text-white"
          )}
        >
          {isYearly ? (
            <motion.span
              layoutId="pricing-switch"
              className="absolute left-0 top-0 h-full w-full rounded-lg border border-[#00f076]/60 bg-gradient-to-t from-[#00b85a] via-[#00f076] to-[#4edea3] shadow-glow-mint"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          ) : null}
          <span className="relative flex items-center gap-2">
            Tahunan
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-bold",
                isYearly
                  ? "bg-[#070a0b] text-[#00f076]"
                  : "bg-[#00f076]/10 text-[#00f076]"
              )}
            >
              Hemat 35%
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false)
  const pricingRef = useRef<HTMLDivElement>(null)

  return (
    <section
      id="pricing"
      ref={pricingRef}
      className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28"
    >
      <article className="mb-10 max-w-2xl space-y-4">
        <span className="inline-block rounded-full border border-[#00f076]/20 bg-[#00f076]/10 px-3 py-1 font-space text-xs font-semibold tracking-[0.04em] text-[#b2ffbe]">
          PRICING
        </span>
        <h2 className="font-space text-[26px] font-bold leading-8 tracking-[-0.01em] text-white md:text-[32px] md:leading-10 md:tracking-[-0.02em]">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.08}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-start"
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
            }}
          >
            Ada plan yang pas buat kamu.
          </VerticalCutReveal>
        </h2>
        <p className="w-[80%] font-jakarta text-[15px] leading-[22px] text-[#bacbb8] sm:w-full sm:max-w-xl">
          Mulai gratis, upgrade kalau butuh lebih. Tanpa biaya tersembunyi,
          batalkan kapan saja.
        </p>
        <PricingSwitch isYearly={isYearly} onChange={setIsYearly} />
      </article>

      <div className="grid gap-4 py-6 md:grid-cols-2">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "relative border transition-all duration-300",
              plan.popular
                ? "border-[#00f076]/50 bg-gradient-to-b from-[#00f076]/8 to-[#181c1d] shadow-glow-mint max-md:-order-1 md:order-none"
                : "border-[#3b4b3c]/40 bg-[#181c1d] hover:border-[#00f076]/30"
            )}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-space text-2xl font-bold text-white md:text-3xl">
                  {plan.name}
                </h3>
                {plan.popular ? (
                  <span className="flex items-center gap-1 rounded-full bg-[#00f076] px-3 py-1 font-space text-xs font-bold text-[#070a0b]">
                    <Sparkles className="size-3.5" />
                    Popular
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-600 bg-slate-700/40 px-3 py-1 font-space text-xs font-bold text-slate-300">
                    GRATIS
                  </span>
                )}
              </div>
              <p className="mt-2 font-jakarta text-sm text-[#bacbb8]">
                {plan.description}
              </p>
              <div className="mt-4 flex items-baseline">
                <span className="font-space text-4xl font-bold text-white">
                  <NumberFlow
                    format={numberFlowFormat}
                    value={isYearly ? plan.yearlyPrice : plan.price}
                    className="font-space text-4xl font-bold"
                  />
                </span>
                <span className="ml-1 font-jakarta text-sm text-slate-400">
                  /{isYearly ? "tahun" : "bulan"}
                </span>
              </div>
              {plan.popular && isYearly ? (
                <p className="font-jakarta text-xs text-[#00f076]">
                  Setara{" "}
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  }).format(Math.round(PRO_PRICING.yearly / 12))}
                  /bulan
                </p>
              ) : null}
            </CardHeader>

            <CardContent className="pt-0">
              <Link
                href="/login"
                className={cn(
                  "group mb-6 flex w-full items-center justify-center gap-2 rounded-xl border p-3.5 font-space text-sm font-bold transition-all duration-150 active:scale-[0.99]",
                  plan.popular
                    ? "border-[#00f076] bg-[#00f076] text-[#070a0b] shadow-glow-mint hover:bg-[#00dc6c]"
                    : "border-[#3b4b3c] bg-transparent text-white hover:border-[#00f076]/50"
                )}
              >
                {plan.buttonText}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <div className="space-y-3 border-t border-[#3b4b3c]/30 pt-4">
                <h4 className="font-space text-xs font-bold tracking-[0.04em] text-white uppercase">
                  Features
                </h4>
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                          plan.popular
                            ? "border-[#00f076]/30 bg-[#00f076]/10 text-[#00f076]"
                            : "border-[#3b4b3c]/40 bg-[#1c2021] text-slate-300"
                        )}
                      >
                        {feature.icon}
                      </span>
                      <span className="font-jakarta text-sm text-slate-200">
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <h4 className="pt-2 font-jakarta text-sm font-semibold text-white">
                  {plan.includes[0]}
                </h4>
                <ul className="space-y-2">
                  {plan.includes.slice(1).map((item) => (
                    <li key={item} className="flex items-center">
                      <span
                        className={cn(
                          "mr-3 mt-0.5 grid size-6 shrink-0 place-content-center rounded-full border",
                          plan.popular
                            ? "border-[#00f076]/40 bg-[#00f076]/10"
                            : "border-[#3b4b3c]/50 bg-[#1c2021]"
                        )}
                      >
                        <CheckCheck
                          className={cn(
                            "size-3.5",
                            plan.popular ? "text-[#00f076]" : "text-slate-400"
                          )}
                        />
                      </span>
                      <span className="font-jakarta text-sm text-slate-400">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
