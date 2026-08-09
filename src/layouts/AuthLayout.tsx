import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/logo'

/**
 * Centered, premium auth screen: logo, card, footer link.
 */
export function AuthLayout({
  children,
  footer,
}: {
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-canvas px-4 py-10">
      {/* Soft brand glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(600px 300px at 50% -50px, rgba(29,207,140,0.12), transparent 70%)',
        }}
      />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link to="/" aria-label="Nuestro Money">
            <Logo size="lg" />
          </Link>
          <p className="font-display text-xl font-semibold tracking-tight text-ink">
            Nuestro Money
          </p>
          <p className="-mt-1.5 text-center text-xs text-ink-3">
            Vuestra banca privada digital
          </p>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-xl shadow-ink/5 sm:p-8">
          {children}
        </div>
        {footer && <div className="mt-5 text-center text-sm text-ink-2">{footer}</div>}
      </div>
    </div>
  )
}
