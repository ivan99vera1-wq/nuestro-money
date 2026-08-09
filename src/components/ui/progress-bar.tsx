import { cn } from '@/utils/cn'
import { clamp01 } from '@/lib/format'

interface ProgressBarProps {
  /** 0..1 (clamped). */
  value: number
  tone?: 'brand' | 'income' | 'expense' | 'amber'
  className?: string
}

const TONES = {
  brand: 'from-brand-500 to-brand-600',
  income: 'from-income-500 to-income-600',
  expense: 'from-expense-500 to-expense-600',
  amber: 'from-amber-400 to-amber-500',
}

export function ProgressBar({ value, tone = 'brand', className }: ProgressBarProps) {
  const pct = clamp01(value) * 100
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-2', className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', TONES[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
