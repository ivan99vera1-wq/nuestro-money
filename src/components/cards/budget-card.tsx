import type { BudgetWithSpend } from '@/services/api/budgets'
import { ALL_CATEGORIES } from '@/config/constants'
import { CategoryIcon } from '@/components/ui/category-icon'
import { Card } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Badge } from '@/components/ui/badge'
import { formatMoney, formatPercent } from '@/lib/format'
import { useCouple } from '@/contexts/CoupleContext'

interface BudgetCardProps {
  budget: BudgetWithSpend
  onClick?: () => void
}

const WARNING_COPY: Record<BudgetWithSpend['warning'], { tone: 'brand' | 'income' | 'expense' | 'amber'; text: string }> = {
  ok: { tone: 'brand', text: '' },
  warning: { tone: 'amber', text: 'Te estás acercando al límite.' },
  reached: { tone: 'expense', text: 'Has alcanzado tu presupuesto.' },
  exceeded: { tone: 'expense', text: 'Has superado tu presupuesto.' },
}

export function BudgetCard({ budget, onClick }: BudgetCardProps) {
  const { couple } = useCouple()
  const currency = couple?.currency ?? 'EUR'
  const meta = ALL_CATEGORIES.find((c) => c.key === budget.category)
  const warning = WARNING_COPY[budget.warning]

  return (
    <Card interactive={Boolean(onClick)} onClick={onClick} className="cursor-pointer">
      <div className="flex items-center gap-3">
        <CategoryIcon category={budget.category} color={meta?.color} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{meta?.label ?? budget.category}</p>
          <p className="mt-0.5 text-xs tabular-nums text-ink-3">
            {formatMoney(budget.spent, currency)} / {formatMoney(budget.limit_amount, currency)}
          </p>
        </div>
        <span className="text-sm font-semibold tabular-nums text-ink-2">
          {formatPercent(budget.progress)}
        </span>
      </div>
      <div className="mt-3">
        <ProgressBar value={budget.progress} tone={warning.tone} />
      </div>
      {warning.text && (
        <p className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-ink-2">
          <Badge tone={budget.warning === 'warning' ? 'amber' : 'expense'}>{warning.text}</Badge>
        </p>
      )}
    </Card>
  )
}
