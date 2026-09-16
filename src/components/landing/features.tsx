import { Bell, CheckCircle2, Tags, Users } from "lucide-react"

export function Features() {
  return (
    <section
      id="features"
      className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto mb-16 max-w-3xl space-y-3 text-center">
        <h2 className="font-space text-[26px] leading-8 font-bold tracking-[-0.01em] text-white md:text-[32px] md:leading-10 md:tracking-[-0.02em]">
          Semua alat pengelola uang yang kamu butuhkan.
        </h2>
        <p className="mx-auto mt-2 max-w-xl font-jakarta text-[15px] leading-[22px] text-[#bacbb8]">
          Stash dirancang untuk kecepatan, akurasi, dan otomasi
          pengeluaran harian tanpa ribet.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Smart Categorization */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#3b4b3c]/40 bg-[#181c1d] p-7 transition-all duration-300 hover:border-[#00f076]/50 md:col-span-7">
          <div className="pointer-events-none absolute -right-10 -bottom-10 size-48 rounded-full bg-[#00f076]/5 blur-3xl transition-all group-hover:bg-[#00f076]/15" />
          <div>
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-[#3b4b3c]/30 bg-[#1c2021] text-[#00f076]">
              <Tags className="size-5" />
            </div>
            <h3 className="font-space text-2xl leading-8 font-semibold tracking-[-0.01em] text-white">
              Smart Categorization
            </h3>
            <p className="mt-2 max-w-lg font-jakarta text-[15px] leading-[22px] text-[#bacbb8]">
              Scan screenshot mutasi GoPay, OVO, ShopeePay, atau m-banking, dan
              biarkan nominal, tanggal, sampai kategori terisi otomatis tanpa
              perlu mencatat manual tiap kali bertransaksi.
            </p>
          </div>
          <div className="mt-8 space-y-2.5 rounded-xl border border-[#3b4b3c]/30 bg-[#0b0f10] p-4">
            <div className="flex items-center justify-between rounded-lg bg-[#181c1d] p-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#00f076]" />
                <span className="font-medium text-white">
                  QRIS Kopi Kenangan Mall
                </span>
              </div>
              <span className="font-space font-bold text-[#00f076]">
                Rp 32.000 &rarr; Kopi &amp; Nongkrong
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#181c1d] p-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#4edea3]" />
                <span className="font-medium text-white">
                  Netflix Monthly Debit
                </span>
              </div>
              <span className="font-space font-bold text-[#4edea3]">
                Rp 54.000 &rarr; Subscriptions
              </span>
            </div>
          </div>
        </div>

        {/* Circle Split-Bill */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#3b4b3c]/40 bg-[#181c1d] p-7 transition-all duration-300 hover:border-[#00f076]/50 md:col-span-5">
          <div>
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-[#3b4b3c]/30 bg-[#1c2021] text-[#4edea3]">
              <Users className="size-5" />
            </div>
            <h3 className="font-space text-2xl leading-8 font-semibold tracking-[-0.01em] text-white">
              Historical Tracking
            </h3>
            <p className="mt-2 font-jakarta text-[15px] leading-[22px] text-[#bacbb8]">
              Telusuri riwayat transaksi lintas bulan dan tahun, filter
              berdasarkan kategori atau tipe, dan lihat tren pengeluaranmu
              lewat grafik interaktif dalam sekali pandang.
            </p>
          </div>
          <div className="mt-6 rounded-xl border border-[#3b4b3c]/30 bg-[#0b0f10] p-4">
            <div className="mb-2 flex items-center justify-between font-space text-[10px] font-bold tracking-[0.06em] text-[#bacbb8]">
              <span>Periode: September 2026</span>
              <span className="font-bold text-white">24 Transaksi</span>
            </div>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-[#1c2021]">
              <div className="h-full w-1/4 bg-[#00f076]" />
              <div className="h-full w-1/4 bg-[#4edea3]" />
              <div className="h-full w-1/4 bg-[#b2ffbe]" />
              <div className="h-full w-1/4 bg-[#313536]" />
            </div>
            <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#b2ffbe]">
              <CheckCircle2 className="size-3" />
              Breakdown kategori otomatis setiap bulan
            </p>
          </div>
        </div>

        {/* Budget Safety Net */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#3b4b3c]/40 bg-[#181c1d] p-7 transition-all duration-300 hover:border-[#00f076]/50 md:col-span-12">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-[#3b4b3c]/30 bg-[#1c2021] text-[#ffb4ab]">
                <Bell className="size-5" />
              </div>
              <h3 className="font-space text-2xl leading-8 font-semibold tracking-[-0.01em] text-white">
                Ringkasan Keuangan Real-Time
              </h3>
              <p className="mt-2 max-w-lg font-jakarta text-[15px] leading-[22px] text-[#bacbb8]">
                Total pemasukan, pengeluaran, dan net cash flow langsung
                ter-update tiap kamu mencatat transaksi, plus donut chart
                breakdown kategori yang gampang dibaca.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-4 rounded-xl border border-[#3b4b3c]/30 bg-[#0b0f10] p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#1c2021] text-[#bacbb8]">
                <Bell className="size-4" />
              </div>
              <div className="text-xs">
                <p className="font-space text-base font-bold text-white">
                  Contoh: Pengeluaran September Rp 3.450.000
                </p>
                <p className="mt-0.5 text-[#bacbb8]">
                  Net cash flow positif Rp 1.200.000, kategori makanan
                  menyumbang 38% dari total pengeluaran bulan ini.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
