import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant | undefined
  size?: Size | undefined
  fullWidth?: boolean | undefined
  loading?: boolean | undefined
  leftIcon?: ReactNode | undefined
  rightIcon?: ReactNode | undefined
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/25 hover:from-brand-400 hover:to-brand-600 active:scale-[0.98] disabled:from-brand-500/60 disabled:to-brand-700/60',
  secondary:
    'bg-surface text-ink border border-line hover:bg-surface-2 active:scale-[0.98]',
  ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink active:scale-[0.98]',
  danger:
    'bg-expense-500 text-white shadow-lg shadow-expense-500/25 hover:bg-expense-600 active:scale-[0.98]',
  outline:
    'border border-brand-600 text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 active:scale-[0.98]',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-xl gap-1.5',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-13 px-6 text-base rounded-2xl gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex select-none items-center justify-center font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-70',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner className="h-4 w-4" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

export function IconButton({
  className,
  children,
  'aria-label': ariaLabel,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label={ariaLabel ?? 'Botón'}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink active:scale-95',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
