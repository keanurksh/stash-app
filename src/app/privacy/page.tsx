import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi Stash App: bagaimana kami mengumpulkan, menggunakan, dan melindungi data keuanganmu.",
}

const SECTIONS = [
  {
    title: "1. Data yang Kami Kumpulkan",
    paragraphs: [
      "Kami hanya mengumpulkan dua jenis data, yaitu:",
    ],
    list: [
      "Data profil dari Google OAuth: nama tampilan, alamat email, dan foto profil yang kamu izinkan saat otorisasi login.",
      "Data transaksi keuangan yang kamu masukkan sendiri: nominal, tanggal, kategori, dan catatan transaksi pemasukan atau pengeluaran.",
    ],
    closing: "Kami tidak pernah meminta atau menyimpan kredensial login perbankan, kata sandi, maupun PIN transaksi pribadi kamu.",
  },
  {
    title: "2. Penggunaan Informasi",
    paragraphs: [
      "Seluruh data yang terkumpul digunakan secara eksklusif untuk menyediakan fitur pencatatan dan visualisasi keuangan pribadi: ringkasan saldo, grafik arus kas, breakdown kategori pengeluaran, dan riwayat transaksi.",
      "Data transaksi kamu tidak digunakan untuk profiling iklan, scoring kredit, maupun tujuan komersial lain di luar fungsi inti aplikasi.",
    ],
  },
  {
    title: "3. Keamanan dan Keberadaan Data",
    paragraphs: [
      "Data kamu disimpan di Supabase (Postgres database) dengan enkripsi standar industri, baik saat transit maupun saat tersimpan.",
      "Akses data dilindungi dengan Row Level Security (RLS): setiap baris data transaksi hanya bisa dibaca, diubah, dan dihapus oleh akun pemiliknya. Tidak ada pengguna lain, termasuk pengguna Stash App lainnya, yang dapat mengakses data kamu.",
    ],
  },
  {
    title: "4. Kerahasiaan Pihak Ketiga",
    paragraphs: [
      "Kami tidak memperjualbelikan, menyewakan, maupun membagikan data pribadi dan transaksi keuangan kamu kepada pihak ketiga untuk keperluan iklan, promosi, atau monetisasi data dalam bentuk apa pun.",
      "Pihak ketiga yang terlibat dalam operasional Layanan hanya Google (otentikasi OAuth) dan Supabase (infrastruktur database), masing-masing dengan kebijakan privasi mereka sendiri yang berlaku atas layanan yang mereka sediakan.",
    ],
  },
  {
    title: "5. Hak dan Kontrol Data Pengguna",
    paragraphs: [
      "Data transaksi sepenuhnya milik kamu. Kamu berhak untuk mengedit dan menghapus setiap transaksi kapan saja langsung dari dashboard.",
      "Menghapus transaksi akan menghapus data tersebut secara permanen dari database kami. Jika kamu ingin menghapus seluruh akun beserta seluruh datanya, kamu dapat keluar dari Layanan dan menghubungi tim kami untuk melakukan penghapusan total atas data yang terkait dengan akun Google kamu.",
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen bg-[#0c1012] font-space text-zinc-100 antialiased selection:bg-[#00f076] selection:text-black"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(0, 240, 118, 0.05) 0%, transparent 60%), radial-gradient(circle at 85% 90%, rgba(0, 240, 118, 0.02) 0%, transparent 40%)",
      }}
    >
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-xs font-medium text-zinc-400 transition-colors duration-150 hover:text-white"
        >
          <ArrowLeft className="size-4 text-zinc-500 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:text-[#00f076]" />
          <span>Kembali ke Halaman Utama</span>
        </Link>

        <header className="mt-8 border-b border-zinc-800 pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Kebijakan Privasi Stash App
          </h1>
          <p className="mt-2 font-jakarta text-sm text-zinc-400">
            Terakhir Diperbarui: 14 September 2026
          </p>
        </header>

        <article className="mt-8 space-y-8 font-jakarta leading-relaxed">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="font-space text-lg font-semibold text-white">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm text-zinc-300">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
                {section.list ? (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.list.map((item) => (
                      <li key={item.slice(0, 32)}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {section.closing ? (
                  <p className="rounded-xl border border-[#00f076]/25 bg-[#00f076]/8 px-4 py-3 text-[#b2ffbe]">
                    {section.closing}
                  </p>
                ) : null}
              </div>
            </section>
          ))}

          <div className="flex items-start gap-3 rounded-2xl border border-[#283136] bg-[#161b1e]/60 p-5">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-400" />
            <p className="text-sm text-zinc-300">
              Otorisasi data kamu diproses aman via Google OAuth 2.0.{" "}
              <Link
                href="/login"
                className="font-medium text-[#00f076] transition-colors hover:text-[#b2ffbe]"
              >
                Masuk ke Stash App
              </Link>{" "}
              atau{" "}
              <Link
                href="/terms"
                className="font-medium text-[#00f076] transition-colors hover:text-[#b2ffbe]"
              >
                baca Syarat &amp; Ketentuan
              </Link>
              .
            </p>
          </div>
        </article>
      </main>
    </div>
  )
}
