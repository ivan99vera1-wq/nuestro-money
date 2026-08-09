import {
  Briefcase,
  PiggyBank,
  Gift,
  RotateCcw,
  Store,
  Tag,
  MoreHorizontal,
  Utensils,
  ShoppingCart,
  Bus,
  Home,
  Plane,
  Clapperboard,
  ShoppingBag,
  HeartPulse,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/utils/cn'

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  salary: Briefcase,
  savings: PiggyBank,
  gift: Gift,
  refund: RotateCcw,
  business: Store,
  sale: Tag,
  other: MoreHorizontal,
  food: Utensils,
  supermarket: ShoppingCart,
  transport: Bus,
  home: Home,
  travel: Plane,
  leisure: Clapperboard,
  shopping: ShoppingBag,
  gifts: Gift,
  health: HeartPulse,
}

const COLOR_BG: Record<string, string> = {
  income: 'bg-income-50 text-income-600 dark:bg-income-950/60 dark:text-income-400',
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400',
  slate: 'bg-surface-2 text-ink-3',
  orange: 'bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400',
  brown: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
  pink: 'bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
  red: 'bg-expense-50 text-expense-600 dark:bg-expense-950/60 dark:text-expense-400',
}

const SIZES = { sm: 'h-9 w-9', md: 'h-11 w-11', lg: 'h-12 w-12' }
const ICON_SIZES = { sm: 'h-4.5 w-4.5', md: 'h-5 w-5', lg: 'h-6 w-6' }

interface CategoryIconProps {
  category: string
  color?: string | undefined
  size?: 'sm' | 'md' | 'lg' | undefined
  className?: string | undefined
}

export function CategoryIcon({ category, color = 'slate', size = 'md', className }: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[category] ?? MoreHorizontal
  return (
    <div
      className={cn(
        'grid shrink-0 place-items-center rounded-xl',
        COLOR_BG[color] ?? COLOR_BG.slate,
        SIZES[size],
        className,
      )}
    >
      <Icon className={ICON_SIZES[size]} />
    </div>
  )
}
