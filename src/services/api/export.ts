/**
 * Export service — downloads the couple's transaction history as CSV or PDF.
 */

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ALL_CATEGORIES } from '@/config/constants'
import { formatMoney } from '@/lib/format'
import type { CoupleRow, ProfileRow, TransactionRow } from '@/types/database'

function categoryLabel(key: string): string {
  return ALL_CATEGORIES.find((c) => c.key === key)?.label ?? key
}

function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

function escapeCsv(value: string): string {
  if (/[";\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export interface ExportSummary {
  balance: number
  income: number
  expense: number
}

export function exportCSV(
  transactions: TransactionRow[],
  couple: CoupleRow,
  summary: ExportSummary,
): void {
  const rows: string[][] = [['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Nota', 'Importe']]
  for (const tx of transactions) {
    rows.push([
      tx.date,
      tx.type === 'income' ? 'Ingreso' : 'Gasto',
      categoryLabel(tx.category),
      tx.description ?? '',
      tx.note ?? '',
      (tx.type === 'income' ? tx.amount : -tx.amount).toString(),
    ])
  }

  const csv =
    '\uFEFF' +
    [
      rows.map((r) => r.map(escapeCsv).join(';')).join('\n'),
      '',
      `Balance;${summary.balance}`,
      `Ingresos;${summary.income}`,
      `Gastos;${summary.expense}`,
      `Moneda;${couple.currency}`,
    ].join('\n')

  downloadFile(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `nuestro-money-movimientos.csv`)
}

export function exportPDF(
  transactions: TransactionRow[],
  couple: CoupleRow,
  profile: ProfileRow,
  summary: ExportSummary,
): void {
  const doc = new jsPDF()
  const currency = couple.currency

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('NUESTRO MONEY', 14, 20)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(`Historial de movimientos — ${profile.full_name ?? 'Nuestra economía'}`, 14, 27)
  doc.text(`Generado el ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 32)
  doc.setTextColor(40)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen', 14, 44)
  doc.setFont('helvetica', 'normal')
  doc.text(
    [
      `Balance: ${formatMoney(summary.balance, currency)}`,
      `Ingresos: ${formatMoney(summary.income, currency)}`,
      `Gastos: ${formatMoney(summary.expense, currency)}`,
    ].join('   ·   '),
    14,
    50,
  )

  autoTable(doc, {
    startY: 58,
    head: [['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Importe']],
    body: transactions.map((tx) => [
      tx.date,
      tx.type === 'income' ? 'Ingreso' : 'Gasto',
      categoryLabel(tx.category),
      tx.description ?? '',
      formatMoney(tx.type === 'income' ? tx.amount : -tx.amount, currency),
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 248, 252] },
  })

  doc.save('nuestro-money-movimientos.pdf')
}
