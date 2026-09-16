"use client"

import { useEffect } from "react"

/**
 * Intercepts clicks on in-page anchor links (href="#...") dan
 * menggulirkan halaman secara halus via JS — dijamin bekerja
 * terlepas dari CSS scroll-behavior atau preferensi reduced-motion
 * pada OS pengguna.
 */
export function SmoothAnchorScroll() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Hanya klik kiri tanpa modifier
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return

      const anchor = (event.target as HTMLElement | null)?.closest(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null
      if (!anchor) return

      const hash = anchor.getAttribute("href")
      if (!hash || hash === "#") return

      const target = document.querySelector(hash)
      if (!target) return

      event.preventDefault()
      target.scrollIntoView({ behavior: "smooth", block: "start" })
      // Update hash tanpa trigger jump
      history.replaceState(null, "", hash)
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  return null
}
