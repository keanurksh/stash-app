export const FREE_OCR_LIMIT = 7
export const FREE_WALLET_LIMIT = 1
export const FREE_WISHLIST_LIMIT = 1
export const FREE_SPLIT_BILL_LIMIT = 1
export const FREE_BUDGET_CAP_LIMIT = 1

export const PRO_PRICING = {
  monthly: 23_000,
  yearly: 179_000,
}

/**
 * Konfigurasi pembayaran manual & kontak admin.
 * Ganti nomor WhatsApp (format internasional tanpa "+") dan rekening di sini.
 */
export const MANUAL_PAYMENT = {
  whatsappNumber: "6287785061395",
  accounts: [
    {
      bank: "BCA",
      number: "7311115298",
      holder: "Luigi Keanureksha Andry",
    },
  ],
  qrisNote: "QRIS tersedia on-request, hubungi admin via WhatsApp.",
}

export function buildWhatsAppUpgradeUrl(options: {
  userEmail: string
  plan: "bulanan" | "tahunan"
}): string {
  const text = `Halo Admin Stash App, saya ingin upgrade Pro Plan.%0A%0AEmail: ${encodeURIComponent(
    options.userEmail
  )}%0APaket: ${options.plan}%0A%0AMohon bantu aktivasi. Terima kasih!`
  return `https://wa.me/${MANUAL_PAYMENT.whatsappNumber}?text=${text}`
}
