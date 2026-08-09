import { useState } from 'react'
import { FileSpreadsheet, FileText, ChevronLeft, Download } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'
import { useBalance } from '@/contexts/BalanceContext'
import { useToast } from '@/contexts/ToastContext'
import { listTransactions } from '@/services/api/transactions'
import { exportCSV, exportPDF } from '@/services/api/export'
import { formatMoney } from '@/lib/format'

export function ExportPage() {
  const { couple } = useCouple()
  const { profile } = useAuth()
  const { balance, income, expense } = useBalance()
  const { toast } = useToast()
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null)

  const summary = { balance, income, expense }

  const runExport = async (kind: 'csv' | 'pdf') => {
    if (!couple || !profile) return
    setExporting(kind)
    try {
      const transactions = await listTransactions(couple.id, undefined, 10000)
      if (kind === 'csv') exportCSV(transactions, couple, summary)
      else exportPDF(transactions, couple, profile, summary)
      toast.success(kind === 'csv' ? 'CSV descargado.' : 'PDF descargado.')
    } catch {
      toast.error('No se pudo exportar los movimientos.')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={() => (window.history.length > 1 ? window.history.back() : undefined)}
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-ink-2 transition-colors hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" /> Atrás
      </button>

      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
          Exportar movimientos
        </h1>
        <p className="mt-1 text-sm text-ink-2">
          Descargad todo vuestro historial en el formato que prefiráis.
        </p>
      </div>

      <Card padded>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-2">Saldo actual</span>
            <span className="font-semibold text-ink">{formatMoney(summary.balance, couple?.currency ?? 'EUR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-2">Ingresos</span>
            <span className="font-medium text-income-600 dark:text-income-400">{formatMoney(summary.income, couple?.currency ?? 'EUR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-2">Gastos</span>
            <span className="font-medium text-expense-600 dark:text-expense-400">{formatMoney(summary.expense, couple?.currency ?? 'EUR')}</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={exporting !== null}
          onClick={() => void runExport('csv')}
          className="flex flex-col items-start gap-3 rounded-3xl border border-line bg-surface p-5 text-left transition-all hover:border-brand-400 active:scale-[0.99] disabled:opacity-50"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <FileSpreadsheet className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-base font-semibold text-ink">CSV</span>
            <span className="block text-sm text-ink-2">Para Excel, Google Sheets o Notion.</span>
          </span>
          <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
            <Download className="h-4 w-4" />
            {exporting === 'csv' ? 'Generando…' : 'Descargar CSV'}
          </span>
        </button>

        <button
          type="button"
          disabled={exporting !== null}
          onClick={() => void runExport('pdf')}
          className="flex flex-col items-start gap-3 rounded-3xl border border-line bg-surface p-5 text-left transition-all hover:border-brand-400 active:scale-[0.99] disabled:opacity-50"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
            <FileText className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-base font-semibold text-ink">PDF</span>
            <span className="block text-sm text-ink-2">Informe limpio para imprimir o archivar.</span>
          </span>
          <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
            <Download className="h-4 w-4" />
            {exporting === 'pdf' ? 'Generando…' : 'Descargar PDF'}
          </span>
        </button>
      </div>
    </div>
  )
}
