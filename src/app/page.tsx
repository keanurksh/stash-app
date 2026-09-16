import { BottomCta } from "@/components/landing/bottom-cta"
import { Features } from "@/components/landing/features"
import { Hero } from "@/components/landing/hero"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import { Onboarding } from "@/components/landing/onboarding"
import { Pricing } from "@/components/landing/pricing"
import { SavingsSimulator } from "@/components/landing/savings-simulator"
import { SmoothAnchorScroll } from "@/components/landing/smooth-anchor-scroll"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0f10] text-[#e0e3e4] antialiased selection:bg-[#00f076] selection:text-[#003917]">
      <SmoothAnchorScroll />
      <LandingNavbar />
      <main>
        <Hero />
        <Features />
        <Onboarding />
        <Pricing />
        <SavingsSimulator />
        <BottomCta />
      </main>
      <LandingFooter />
    </div>
  )
}
