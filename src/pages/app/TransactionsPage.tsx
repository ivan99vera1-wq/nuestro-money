import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowLeftRight, SlidersHorizontal } from 'lucide-react'
import { TransactionCard } from '@/components/cards/transaction-card'
import { Tabs } from '@/components/ui/tabs'
import { Input, Select } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { InlineLoader } from '@/components/ui/loading'
import { useTransactions } from '@/hooks/useTransactions'
import { useDebounce } from '@/hooks/useDebounce'
import { ALL_CATEGORIES } from '@/config/constants'
import type { TransactionFilters, TransactionType } from '@/types/domain'

const TYPE_TABS = [
  { value: 'all' as const, label: 'Todos' },
  { value: 'income' as const, label: 'Ingresos' },
  { value: 'expense' as const, label: 'Gastos' },
]

export function TransactionsPage() {
  const navigate = useNavigate()
  const [type, setType] = useState<TransactionType | 'all'>('all')
  const [category, setCategory] = useState<string>('all')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  const filters = useMemo<TransactionFilters>(
    () => ({ type, category, from: from || null, to: to || null, query: debouncedQuery }),
    [type, category, from, to, debouncedQuery],
  )

  const { transactions, loading } = useTransactions(filters)

  const categoryOptions = useMemo(
    () => [
      { value: 'all', label: 'Todas las categorías' },
      ...ALL_CATEGORIES.map((c) => ({ value: c.key, label: c.label })),
    ],
    [],
  )

  const hasActiveFilters =
    type !== 'all' || category !== 'all' || Boolean(from) || Boolean(to) || Boolean(query.trim())

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Movimientos</h1>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-3" />
        <input
          type="search"
          placeholder="Buscar movimientos…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 w-full rounded-2xl border border-line bg-surface pl-11 pr-4 text-sm text-ink placeholder:text-ink-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
        />
      </div>

      <Tabs items={TYPE_TABS} value={type} onChange={setType} />

      <button
        type="button"
        onClick={() => setShowFilters((v) => !v)}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-ink-2 transition-colors hover:text-ink"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filtros {hasActiveFilters && '· activos'}
      </button>

      {showFilters && (
        <div className="grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-3">
          <Select
            label="Categoría"
            options={categoryOptions}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Input label="Desde" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="Hasta" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      )}

      {/* List */}
      {loading ? (
        <InlineLoader />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<ArrowLeftRight className="h-7 w-7" />}
          title={hasActiveFilters ? 'Sin resultados' : 'Todavía no tenéis movimientos'}
          description={
            hasActiveFilters
              ? 'Ningún movimiento coincide con los filtros seleccionados.'
              : 'Empezad registrando vuestro primer ingreso o gasto.'
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map((tx) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              onClick={() => navigate(`/transactions/${tx.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
