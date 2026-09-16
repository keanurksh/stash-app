import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan ketentuan penggunaan Stash App, aplikasi pencatatan keuangan pribadi.",
}

const SECTIONS = [
  {
    title: "1. Ketentuan Umum",
    paragraphs: [
      "Stash App (selanjutnya disebut \"Layanan\") adalah aplikasi pencatatan keuangan pribadi yang membantu kamu mendokumentasikan pemasukan, pengeluaran, dan arus kas harian. Dengan menggunakan Layanan ini, kamu dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang tercantum pada halaman ini.",
      "Stash App bukan merupakan alat perbankan, payment gateway, maupun penyedia nasihat investasi keuangan. Seluruh fitur pada Layanan ini bersifat administratif dan visualisasi data semata, sehingga tidak ada dana finansial yang diproses, disimpan, atau dipindahkan melalui platform kami.",
    ],
  },
  {
    title: "2. Akun dan Otentikasi",
    paragraphs: [
      "Pendaftaran dan masuk ke Layanan hanya dilakukan melalui otentikasi Google OAuth. Kami tidak menyediakan pendaftaran manual dengan kata sandi, sehingga seluruh proses verifikasi identitas ditangani oleh Google sesuai kebijakan mereka.",
      "Tanggung jawab atas keamanan akun Google yang kamu gunakan untuk mengakses Layanan sepenuhnya berada pada kamu sebagai pemilik akun. Segala aktivitas yang terjadi melalui akunmu dianggap sebagai aktivitas yang sah dan kamu izinkan. Segera lakukan logout setelah selesai menggunakan perangkat yang bersifat publik atau bersama.",
    ],
  },
  {
    title: "3. Penggunaan Fitur Pemindaian OCR",
    paragraphs: [
      "Layanan menyediakan fitur pemindaian Optical Character Recognition (OCR) untuk mengekstraksi nominal, tanggal, dan informasi relevan lainnya dari screenshot bukti transfer atau mutasi e-wallet dan m-banking secara otomatis.",
      "Proses pemindaian berjalan sepenuhnya di sisi perangkat kamu (client-side) dan hasil ekstraksi bersifat prediktif. Kamu wajib memverifikasi dan mengonfirmasi kembali seluruh hasil pemindaian sebelum menyimpan transaksi. Kami tidak bertanggung jawab atas kesalahan pencatatan yang terjadi karena ketidaktepatan hasil OCR yang tidak diverifikasi oleh pengguna.",
    ],
  },
  {
    title: "4. Batasan Tanggung Jawab",
    paragraphs: [
      "Layanan disediakan \"sebagaimana adanya\" (as-is) tanpa jaminan dalam bentuk apa pun, baik tersurat maupun tersirat. Kami tidak menjamin bahwa Layanan akan selalu tersedia tanpa gangguan, bebas dari error, atau sesuai dengan semua kebutuhan kamu.",
      "Dalam segala kondisi, Stash App tidak bertanggung jawab atas kerugian finansial pribadi, kehilangan data, keputusan finansial, maupun dampak hukum apa pun yang timbul dari penggunaan atau ketidakmampuan menggunakan Layanan. Seluruh catatan keuangan yang kamu masukkan adalah tanggung jawab kamu sendiri sebagai pemilik data.",
    ],
  },
  {
    title: "5. Perubahan Layanan dan Ketentuan",
    paragraphs: [
      "Kami berhak untuk memperbarui, mengubah, atau menghentikan sementara maupun permanen seluruh atau sebagian fitur Layanan tanpa pemberitahuan sebelumnya.",
      "Syarat dan ketentuan ini dapat berubah dari waktu ke waktu mengikuti perkembangan Layanan. Perubahan berlaku sejak dipublikasikan pada halaman ini. Kami menyarankan kamu untuk memeriksa halaman ini secara berkala. Penggunaan Layanan secara berkelanjutan setelah perubahan dianggap sebagai persetujuanmu terhadap ketentuan yang diperbarui.",
    ],
  },
]

export default function TermsPage() {
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
            Syarat dan Ketentuan Stash App
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
              </div>
            </section>
          ))}

          <section className="rounded-2xl border border-[#283136] bg-[#161b1e]/60 p-5 text-sm text-zinc-300">
            <p>
              Ada pertanyaan tentang syarat dan ketentuan ini?{" "}
              <Link
                href="/login"
                className="font-medium text-[#00f076] transition-colors hover:text-[#b2ffbe]"
              >
                Masuk ke Stash App
              </Link>{" "}
              atau{" "}
              <Link
                href="/privacy"
                className="font-medium text-[#00f076] transition-colors hover:text-[#b2ffbe]"
              >
                baca Kebijakan Privasi
              </Link>
              .
            </p>
          </section>
        </article>
      </main>
    </div>
  )
}
