import Link from "next/link"

const FOOTER_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Kalkulator", href: "#calculator" },
  { label: "Pricing", href: "#pricing" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
]

export function LandingFooter() {
  return (
    <footer className="border-t border-[#3b4b3c]/20 bg-[#0b0f10]">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 md:flex-row md:px-8">
        <div className="flex flex-col items-center space-y-2 md:items-start">
          <Link
            href="/"
            className="font-space text-2xl leading-8 font-semibold tracking-[-0.01em] font-bold tracking-tight text-[#b2ffbe]"
          >
            Money Manager
          </Link>
          <p className="max-w-md text-center font-jakarta text-[13px] leading-[18px] text-[#bacbb8] md:text-left">
            &copy; {new Date().getFullYear()} Money Manager. All rights
            reserved. Bank-grade 256-bit encryption. Built for digital earners.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-center md:text-right">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-jakarta text-[13px] leading-[18px] text-[#bacbb8] transition-colors duration-150 hover:text-[#00f076]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
