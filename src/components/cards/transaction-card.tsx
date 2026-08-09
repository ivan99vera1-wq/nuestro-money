import type { TransactionRow } from '@/types/database'
import { ALL_CATEGORIES } from '@/config/constants'
import { CategoryIcon } from '@/components/ui/category-icon'
import { formatDateShort, formatSigned } from '@/lib/format'
import { useCouple } from '@/contexts/CoupleContext'
import { cn } from '@/utils/cn'

interface TransactionCardProps {
  transaction: TransactionRow
  onClick?: () => void
}

function categoryMeta(category: string) {
  return ALL_CATEGORIES.find((c) => c.key === category)
}

export function TransactionCard({ transaction, onClick }: TransactionCardProps) {
  const { couple } = useCouple()
  const meta = categoryMeta(transaction.category)
  const isIncome = transaction.type === 'income'

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3.5 rounded-2xl border border-line bg-surface px-4 py-3 text-left transition-all hover:border-brand-300 hover:shadow-sm',
        onClick && 'active:scale-[0.99]',
      )}
    >
      <CategoryIcon category={transaction.category} color={meta?.color} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">
          {transaction.description || meta?.label || 'Movimiento'}
        </p>
        <p className="mt-0.5 text-xs text-ink-3">
          {meta?.label} · {formatDateShort(transaction.date)}
        </p>
      </div>
      <p
        className={cn(
          'shrink-0 text-sm font-semibold tabular-nums',
          isIncome ? 'text-income-600 dark:text-income-400' : 'text-ink',
        )}
      >
        {formatSigned(isIncome ? transaction.amount : -transaction.amount, couple?.currency ?? 'EUR')}
      </p>
    </button>
  )
}
