"use client"

import { useEffect, useState } from "react"

/**
 * Media query hook yang aman untuk SSR + React Compiler:
 * nilai awal dibaca sinkron saat mount (initializer, bukan setState),
 * update berikutnya hanya lewat event listener.
 */
export function useMediaQuery(query: string): boolean | undefined {
  const [matches, setMatches] = useState<boolean | undefined>(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : undefined
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)
    mql.addEventListener("change", onChange)
    // Sinkronisasi ulang setelah mount tanpa setState sinkron di body effect
    void Promise.resolve().then(() => {
      setMatches(mql.matches)
    })
    return () => mql.removeEventListener("change", onChange)
  }, [query])

  return matches
}
