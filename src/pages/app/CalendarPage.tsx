import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  addMonths,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { TransactionCard } from '@/components/cards/transaction-card'
import { EmptyState } from '@/components/ui/empty-state'
import { InlineLoader } from '@/components/ui/loading'
import { useTransactions } from '@/hooks/useTransactions'
import { useCouple } from '@/contexts/CoupleContext'
import { toISODate } from '@/lib/calendar'
import { formatMoney } from '@/lib/format'
import { cn } from '@/utils/cn'
import type { TransactionRow } from '@/types/database'

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export function CalendarPage() {
  const navigate = useNavigate()
  const { couple } = useCouple()
  const [month, setMonth] = useState(startOfMonth(new Date()))

  const range = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
    return { from: toISODate(start), to: toISODate(end) }
  }, [month])

  const { transactions, loading } = useTransactions({ type: 'all', category: 'all', query: '', ...range })
  const [selected, setSelected] = useState<Date>(new Date())

  const byDate = useMemo(() => {
    const map = new Map<string, TransactionRow[]>()
    for (const tx of transactions) {
      const arr = map.get(tx.date) ?? []
      arr.push(tx)
      map.set(tx.date, arr)
    }
    return map
  }, [transactions])

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
    const out: Date[] = []
    let cursor = start
    while (cursor <= end) {
      out.push(cursor)
      cursor = addDays(cursor, 1)
    }
    return out
  }, [month])

  const selectedKey = toISODate(selected)
  const selectedTx = byDate.get(selectedKey) ?? []
  const currency = couple?.currency ?? 'EUR'

  const dayTotals = (d: Date) => {
    const list = byDate.get(toISODate(d)) ?? []
    let income = 0
    let expense = 0
    for (const tx of list) {
      if (tx.type === 'income') income += tx.amount
      else expense += tx.amount
    }
    return { income, expense }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Calendario</h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-surface text-ink-2 transition-colors hover:text-ink"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="w-32 text-center text-sm font-semibold text-ink">
            {format(month, 'MMMM yyyy', { locale: es })}
          </span>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-surface text-ink-2 transition-colors hover:text-ink"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-surface p-4">
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="pb-2 text-center text-xs font-medium text-ink-3">
              {d}
            </div>
          ))}
          {days.map((d, i) => {
            const { income, expense } = dayTotals(d)
            const hasMovements = income > 0 || expense > 0
            const isSelected = isSameDay(d, selected)
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(d)}
                className={cn(
                  'flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl text-sm transition-colors',
                  isSameMonth(d, month) ? 'text-ink' : 'text-ink-3/50',
                  isToday(d) && 'font-bold text-brand-600',
                  isSelected && 'bg-brand-600 text-white',
                  !isSelected && hasMovements && 'bg-surface-2',
                )}
              >
                <span>{format(d, 'd')}</span>
                {hasMovements && (
                  <span className="flex gap-0.5">
                    {income > 0 && <i className="h-1.5 w-1.5 rounded-full bg-income-500" />}
                    {expense > 0 && <i className="h-1.5 w-1.5 rounded-full bg-expense-500" />}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day */}
      <div>
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h2 className="font-display text-base font-semibold text-ink">
            {format(selected, "EEEE d 'de' MMMM", { locale: es })}
          </h2>
          {selectedTx.length > 0 && (
            <span className="text-xs text-ink-2">
              {formatMoney(dayTotals(selected).income, currency)} · −
              {formatMoney(dayTotals(selected).expense, currency)}
            </span>
          )}
        </div>

        {loading ? (
          <InlineLoader />
        ) : selectedTx.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" />}
            title="Sin movimientos"
            description="No hay registros para este día."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {selectedTx.map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onClick={() => navigate(`/transactions/${tx.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
