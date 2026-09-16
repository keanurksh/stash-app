import type { MetadataRoute } from "next"

// Ganti dengan domain produksi saat deploy, mis. https://stash.app
const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://stash.app"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/terms", "/privacy"],
        // Area terotentikasi & API tidak untuk di-crawl
        disallow: ["/dashboard", "/admin", "/api/", "/auth/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
