import { format, parseISO } from "date-fns"

import { formatIDR } from "@/lib/format"
import type { Category, Transaction } from "@/types"

interface ExportRow {
  tanggal: string
  kategori: string
  tipe: string
  catatan: string
  nominal: number
}

function buildRows(transactions: Transaction[], categories: Category[]): ExportRow[] {
  return transactions.map((t) => ({
    tanggal: format(parseISO(t.date), "yyyy-MM-dd"),
    kategori:
      (t.category_id ? categories.find((c) => c.id === t.category_id)?.name : "") ??
      "Tanpa Kategori",
    tipe: t.type === "income" ? "Pemasukan" : "Pengeluaran",
    catatan: t.notes ?? "",
    nominal: t.type === "income" ? t.amount : -t.amount,
  }))
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function csvEscape(value: string | number): string {
  const str = String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportCsv(transactions: Transaction[], categories: Category[]) {
  const rows = buildRows(transactions, categories)
  // BOM agar Excel mengenali UTF-8
  const csv =
    "\uFEFF" +
    ["Tanggal", "Kategori", "Tipe", "Catatan", "Nominal"].join(";") +
    "\n" +
    rows
      .map((r) =>
        [r.tanggal, csvEscape(r.kategori), r.tipe, csvEscape(r.catatan), r.nominal].join(";")
      )
      .join("\n")

  downloadBlob(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    `stash-transactions-${new Date().toISOString().slice(0, 10)}.csv`
  )
}

export function exportExcel(transactions: Transaction[], categories: Category[]) {
  const rows = buildRows(transactions, categories)
  const tableHtml = `
    <html xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="utf-8" /></head>
      <body>
        <table border="1">
          <thead>
            <tr>
              <th>Tanggal</th><th>Kategori</th><th>Tipe</th><th>Catatan</th><th>Nominal</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (r) =>
                  `<tr><td>${r.tanggal}</td><td>${r.kategori}</td><td>${r.tipe}</td><td>${r.catatan}</td><td>${r.nominal}</td></tr>`
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>`

  downloadBlob(
    new Blob([tableHtml], { type: "application/vnd.ms-excel" }),
    `stash-transactions-${new Date().toISOString().slice(0, 10)}.xls`
  )
}

export function exportPdf(transactions: Transaction[], categories: Category[]) {
  const rows = buildRows(transactions, categories)
  const totalIn = rows
    .filter((r) => r.nominal > 0)
    .reduce((s, r) => s + r.nominal, 0)
  const totalOut = rows
    .filter((r) => r.nominal < 0)
    .reduce((s, r) => s + Math.abs(r.nominal), 0)

  const win = window.open("", "_blank", "width=900,height=650")
  if (!win) {
    throw new Error("POPUP_BLOCKED")
  }

  win.document.write(`
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Stash - Riwayat Transaksi</title>
        <style>
          body { font-family: system-ui, sans-serif; color: #0b0f10; padding: 24px; }
          h1 { font-size: 20px; margin: 0; }
          p { font-size: 12px; color: #475569; margin: 4px 0 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
          th { background: #f1f5f9; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; }
          td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
          .pos { color: #00682f; }
          .neg { color: #b91c1c; }
          .totals { margin-top: 16px; font-size: 13px; text-align: right; }
          .totals strong { font-variant-numeric: tabular-nums; }
        </style>
      </head>
      <body>
        <h1>Stash &mdash; Riwayat Transaksi</h1>
        <p>Dibuat pada ${format(new Date(), "d MMMM yyyy, HH:mm")} &bull; ${rows.length} transaksi</p>
        <table>
          <thead>
            <tr>
              <th>Tanggal</th><th>Kategori</th><th>Tipe</th><th>Catatan</th><th class="num">Nominal</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (r) =>
                  `<tr>
                    <td>${r.tanggal}</td>
                    <td>${r.kategori}</td>
                    <td>${r.tipe}</td>
                    <td>${r.catatan}</td>
                    <td class="num ${r.nominal >= 0 ? "pos" : "neg"}">${formatIDR(r.nominal)}</td>
                  </tr>`
              )
              .join("")}
          </tbody>
        </table>
        <div class="totals">
          <p>Total Pemasukan: <strong class="pos">${formatIDR(totalIn)}</strong></p>
          <p>Total Pengeluaran: <strong class="neg">${formatIDR(totalOut)}</strong></p>
          <p>Net Cash Flow: <strong>${formatIDR(totalIn - totalOut)}</strong></p>
        </div>
      </body>
    </html>`
  )
  win.document.close()
  win.focus()
  win.print()
}
