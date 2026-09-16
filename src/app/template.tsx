"use client"

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

/**
 * Membungkus halaman dengan animasi masuk yang halus.
 * template.tsx (bukan layout.tsx) otomatis remount saat navigasi,
 * sehingga animasi ini diputar ulang di setiap perpindahan halaman.
 */
export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}
