import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { PiggyBank, TrendingUp, TrendingDown, Scale, Trophy } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Tabs } from '@/components/ui/tabs'
import { InlineLoader } from '@/components/ui/loading'
import { BalanceChart } from '@/components/charts/balance-chart'
import { IncomeExpenseChart } from '@/components/charts/income-expense-chart'
import { DonutChart } from '@/components/charts/donut-chart'
import { useAllTransactions } from '@/features/stats/useAllTransactions'
import {
  buildBalanceSeries,
  categoryBreakdown,
  computeAnnualSummary,
  computeSummary,
} from '@/features/stats/aggregate'
import { useCouple } from '@/contexts/CoupleContext'
import { daysAgoISO, monthsAgoISO, todayISO } from '@/lib/calendar'
import { formatMoney, formatMoneyCompact, formatPercent } from '@/lib/format'
import { ALL_CATEGORIES } from '@/config/constants'
import { cn } from '@/utils/cn'

const PERIODS = [
  { value: '7d' as const, label: '7 días' },
  { value: '30d' as const, label: '30 días' },
  { value: '3m' as const, label: '3 meses' },
  { value: '6m' as const, label: '6 meses' },
  { value: '1a' as const, label: '1 año' },
]

const PALETTE = [
  '#7c3aed',
  '#4f46e5',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#f43f5e',
  '#8b5cf6',
  '#14b8a6',
  '#fb7185',
  '#a3a3a3',
]

interface Bucket {
  label: string
  income: number
  expense: number
}

export function StatsPage() {
  const { couple } = useCouple()
  const { transactions, loading } = useAllTransactions()
  const currency = couple?.currency ?? 'EUR'
  const [period, setPeriod] = useState<(typeof PERIODS)[number]['value']>('30d')

  const range = useMemo(() => {
    const to = todayISO()
    const from =
      period === '7d' ? daysAgoISO(7) : period === '30d' ? daysAgoISO(30) : monthsAgoISO(period === '3m' ? 3 : period === '6m' ? 6 : 12)
    return { from, to }
  }, [period])

  const inRange = useMemo(
    () => transactions.filter((t) => t.date >= range.from && t.date <= range.to),
    [transactions, range],
  )

  const summary = useMemo(() => computeSummary(inRange), [inRange])

  const buckets = useMemo<Bucket[]>(() => {
    const daily = period === '7d' || period === '30d'
    if (daily) {
      const byDay = new Map<string, { income: number; expense: number }>()
      for (const t of inRange) {
        const b = byDay.get(t.date) ?? { income: 0, expense: 0 }
        if (t.type === 'income') b.income += t.amount
        else b.expense += t.amount
        byDay.set(t.date, b)
      }
      return [...byDay.entries()]
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([key, b]) => ({ label: key.slice(8), ...b }))
    }
    const byMonth = new Map<string, { income: number; expense: number }>()
    for (const t of inRange) {
      const key = t.date.slice(0, 7)
      const b = byMonth.get(key) ?? { income: 0, expense: 0 }
      if (t.type === 'income') b.income += t.amount
      else b.expense += t.amount
      byMonth.set(key, b)
    }
    return [...byMonth.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, b]) => ({
        label: format(new Date(`${key}-01T00:00:00`), 'MMM', { locale: es }),
        ...b,
      }))
  }, [inRange, period])

  const balanceSeries = useMemo(
    () => buildBalanceSeries(transactions, range.from, range.to),
    [transactions, range],
  )

  const breakdown = useMemo(() => categoryBreakdown(inRange, PALETTE), [inRange])
  const annual = useMemo(() => computeAnnualSummary(transactions, new Date().getFullYear().toString()), [transactions])

  const monthlyLabel = (key: string | null) =>
    key ? format(new Date(`${key}-01T00:00:00`), 'MMMM yyyy', { locale: es }) : '—'

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Estadísticas</h1>
        <Tabs items={PERIODS} value={period} onChange={setPeriod} />
      </div>

      {loading ? (
        <InlineLoader />
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Ingresos"
              value={formatMoney(summary.income, currency)}
              icon={<TrendingUp className="h-4 w-4" />}
              tint="text-income-600 dark:text-income-400 bg-income-100 dark:bg-income-950/50"
            />
            <StatCard
              label="Gastos"
              value={formatMoney(summary.expense, currency)}
              icon={<TrendingDown className="h-4 w-4" />}
              tint="text-expense-600 dark:text-expense-400 bg-expense-100 dark:bg-expense-950/50"
            />
            <StatCard
              label="Balance"
              value={formatMoney(summary.balance, currency)}
              icon={<Scale className="h-4 w-4" />}
              tint="text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-950/50"
            />
            <StatCard
              label="Ahorro"
              value={summary.savingsRate !== null ? formatPercent(summary.savingsRate * 100) : '—'}
              icon={<PiggyBank className="h-4 w-4" />}
              tint="text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50"
            />
          </div>

          {/* Balance evolution */}
          <Card padded>
            <h2 className="mb-1 font-display text-base font-semibold text-ink">Evolución del saldo</h2>
            <p className="mb-3 text-sm text-ink-2">Saldo acumulado en el periodo seleccionado.</p>
            <BalanceChart data={balanceSeries} />
          </Card>

          {/* Income vs expense */}
          <Card padded>
            <h2 className="mb-1 font-display text-base font-semibold text-ink">Ingresos vs gastos</h2>
            <p className="mb-3 text-sm text-ink-2">
              {period === '7d' || period === '30d' ? 'Desglose diario.' : 'Desglose mensual.'}
            </p>
            <IncomeExpenseChart data={buckets} />
          </Card>

          {/* Category breakdown */}
          {breakdown.length > 0 && (
            <Card padded>
              <h2 className="mb-1 font-display text-base font-semibold text-ink">Gastos por categoría</h2>
              <p className="mb-3 text-sm text-ink-2">Dónde se va vuestro dinero.</p>
              <DonutChart data={breakdown} />
              <ul className="mt-4 flex flex-col gap-2">
                {breakdown.map((slice) => (
                  <li key={slice.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink-2">
                      <i className="h-2.5 w-2.5 rounded-full" style={{ background: slice.color }} />
                      {ALL_CATEGORIES.find((c) => c.key === slice.name)?.label ?? slice.name}
                    </span>
                    <span className="font-medium text-ink">{formatMoneyCompact(slice.value, currency)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Annual summary */}
          {annual.totalExpense > 0 && (
            <Card padded>
              <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-ink">
                <Trophy className="h-4 w-4 text-amber-500" /> Resumen anual
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                <AnnualItem label="Ingresos" value={formatMoney(annual.totalIncome, currency)} />
                <AnnualItem label="Gastos" value={formatMoney(annual.totalExpense, currency)} />
                <AnnualItem
                  label="Ahorrado"
                  value={formatMoney(annual.totalSaved, currency)}
                  positive={annual.totalSaved > 0}
                />
                <AnnualItem label="Mejor mes" value={monthlyLabel(annual.bestMonth?.key ?? null)} />
                <AnnualItem label="Peor mes" value={monthlyLabel(annual.worstMonth?.key ?? null)} />
                <AnnualItem
                  label="Top categoría"
                  value={
                    annual.topCategory
                      ? (ALL_CATEGORIES.find((c) => c.key === annual.topCategory!.category)?.label ??
                        annual.topCategory.category)
                      : '—'
                  }
                />
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  tint,
}: {
  label: string
  value: string
  icon: React.ReactNode
  tint: string
}) {
  return (
    <Card padded className="flex flex-col gap-2">
      <span className={cn('grid h-8 w-8 place-items-center rounded-xl', tint)}>{icon}</span>
      <span className="text-xs text-ink-2">{label}</span>
      <span className="font-display text-lg font-semibold tracking-tight text-ink">{value}</span>
    </Card>
  )
}

function AnnualItem({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div>
      <p className="text-xs text-ink-2">{label}</p>
      <p className={cn('mt-0.5 font-medium text-ink', positive && 'text-income-600 dark:text-income-400')}>{value}</p>
    </div>
  )
}
