import { CategoryIcon } from '@/components/ui/category-icon'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, type TransactionType } from '@/config/constants'
import { cn } from '@/utils/cn'

interface CategoryPickerProps {
  type: TransactionType
  value: string
  onChange: (key: string) => void
}

export function CategoryPicker({ type, value, onChange }: CategoryPickerProps) {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {categories.map((category) => {
        const active = value === category.key
        return (
          <button
            key={category.key}
            type="button"
            onClick={() => onChange(category.key)}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all',
              active
                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                : 'border-line bg-surface-2/50 text-ink-2 hover:border-brand-300 hover:text-ink',
            )}
            aria-pressed={active}
          >
            <CategoryIcon category={category.key} color={category.color} size="sm" />
            <span className="truncate">{category.label}</span>
          </button>
        )
      })}
    </div>
  )
}
