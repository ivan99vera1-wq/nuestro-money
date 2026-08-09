import { cn } from '@/utils/cn'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'h-9 w-9 rounded-xl',
  md: 'h-12 w-12 rounded-2xl',
  lg: 'h-16 w-16 rounded-2xl',
}

const INNER = { sm: 'h-5 w-5', md: 'h-7 w-7', lg: 'h-9 w-9' }

export function Logo({ size = 'md', className }: LogoProps) {
  return (
    <div
      className={cn(
        'grid place-items-center bg-gradient-to-br from-brand-500 to-brand-800 shadow-lg shadow-brand-600/25',
        SIZES[size],
        className,
      )}
    >
      <svg viewBox="0 0 64 64" className={INNER[size]} aria-hidden="true">
        <g fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round">
          <circle cx="25" cy="32" r="14.5" />
          <circle cx="39" cy="32" r="14.5" />
        </g>
        <circle cx="32" cy="32" r="6" fill="#fff" />
      </svg>
    </div>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Logo size="sm" />
      <div className="leading-tight">
        <p className="font-display text-[15px] font-semibold tracking-tight text-ink">
          Nuestro Money
        </p>
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-3">
          Vuestra banca
        </p>
      </div>
    </div>
  )
}
