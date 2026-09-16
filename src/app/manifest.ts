import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stash",
    short_name: "Stash",
    description:
      "Kelola keuangan pribadi: catat transaksi, scan screenshot mutasi, dan pantau grafik keuanganmu.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
  }
}
