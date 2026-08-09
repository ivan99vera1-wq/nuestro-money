import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padded?: boolean
  interactive?: boolean
}

export function Card({ children, padded = true, interactive, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-surface shadow-sm shadow-ink/5',
        padded && 'p-5',
        interactive && 'transition-all hover:border-brand-300 hover:shadow-md active:scale-[0.99]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
