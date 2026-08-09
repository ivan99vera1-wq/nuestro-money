import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type BadgeTone = 'brand' | 'income' | 'expense' | 'amber' | 'violet' | 'slate'

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

const TONES: Record<BadgeTone, string> = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300',
  income: 'bg-income-50 text-income-700 dark:bg-income-950/60 dark:text-income-400',
  expense: 'bg-expense-50 text-expense-700 dark:bg-expense-950/60 dark:text-expense-400',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400',
  slate: 'bg-surface-2 text-ink-2',
}

export function Badge({ tone = 'slate', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
