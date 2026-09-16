"use client"

import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

/**
 * Progress bar tipis di atas viewport saat pindah halaman.
 * Key = pathname membuat bar remount di setiap navigasi, memutar
 * ulang animasinya tanpa perlu state: melebar 0 -> 100% lalu fade out.
 */
export function RouteTransitionBar() {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      initial={{ scaleX: 0, opacity: 1 }}
      animate={{
        scaleX: [0, 1, 1],
        opacity: [1, 1, 0],
        transition: { duration: 0.9, times: [0, 0.55, 1], ease: "easeOut" },
      }}
      style={{ transformOrigin: "left" }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 bg-gradient-to-r from-[#00b85a] via-[#00f076] to-[#b2ffbe] shadow-[0_0_8px_rgba(0,240,118,0.6)]"
    />
  )
}
