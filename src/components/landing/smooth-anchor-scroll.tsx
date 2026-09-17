"use client"

import { useEffect } from "react"

const DURATION = 600
const CORRECT_DURATION = 250

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Smooth scroll kustom untuk link anchor (href="#...").
 *
 * Kenapa tidak pakai scrollIntoView({ behavior: "smooth" }) bawaan?
 * Durasinya proporsional terhadap jarak di Chrome mobile, sehingga
 * lompatan jauh (mis. navbar -> pricing) terasa lambat dan patah-patah
 * di halaman yang berat. Versi ini selalu 600ms dengan easing tetap,
 * bisa dibatalkan user, dan menghormati prefers-reduced-motion.
 */
export function SmoothAnchorScroll() {
  useEffect(() => {
    let raf = 0
    let cancelled = false

    const cancel = () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }

    const scrollPaddingTop = () => {
      const raw = getComputedStyle(document.documentElement).scrollPaddingTop
      const parsed = parseFloat(raw)
      return Number.isFinite(parsed) ? parsed : 0
    }

    const animateTo = (
      destY: number,
      duration: number,
      onDone?: () => void
    ) => {
      const startY = window.scrollY
      const distance = destY - startY
      if (Math.abs(distance) < 2) {
        onDone?.()
        return
      }
      const start = performance.now()
      const step = (now: number) => {
        if (cancelled) return
        const progress = Math.min((now - start) / duration, 1)
        window.scrollTo(0, startY + distance * easeInOutCubic(progress))
        if (progress < 1) {
          raf = requestAnimationFrame(step)
        } else {
          onDone?.()
        }
      }
      raf = requestAnimationFrame(step)
    }

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

      // Hormati preferensi reduced-motion: langsung lompat
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        target.scrollIntoView({ block: "start" })
        history.replaceState(null, "", hash)
        return
      }

      cancelled = false
      const maxY = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0
      )
      const rect = target.getBoundingClientRect()
      const destY = Math.min(
        Math.max(rect.top + window.scrollY - scrollPaddingTop(), 0),
        maxY
      )

      animateTo(destY, DURATION, () => {
        // Koreksi akhir: konten offscreen (content-visibility) bisa
        // menggeser layout saat ter-render di tengah animasi.
        const fresh = target.getBoundingClientRect()
        const expected = scrollPaddingTop()
        if (Math.abs(fresh.top - expected) > 8) {
          cancelled = false
          const corrected = Math.min(
            Math.max(fresh.top + window.scrollY - expected, 0),
            Math.max(
              document.documentElement.scrollHeight - window.innerHeight,
              0
            )
          )
          animateTo(corrected, CORRECT_DURATION, () => {
            history.replaceState(null, "", hash)
          })
        } else {
          history.replaceState(null, "", hash)
        }
      })
    }

    // Batalkan animasi begitu user ambil alih scroll manual
    window.addEventListener("wheel", cancel, { passive: true })
    window.addEventListener("touchmove", cancel, { passive: true })
    window.addEventListener("keydown", cancel)
    document.addEventListener("click", handleClick)
    return () => {
      cancel()
      window.removeEventListener("wheel", cancel)
      window.removeEventListener("touchmove", cancel)
      window.removeEventListener("keydown", cancel)
      document.removeEventListener("click", handleClick)
    }
  }, [])

  return null
}
