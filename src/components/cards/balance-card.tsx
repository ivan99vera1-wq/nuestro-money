import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { formatMoney } from '@/lib/format'
import { useBalance } from '@/contexts/BalanceContext'
import { useCouple } from '@/contexts/CoupleContext'

export function BalanceCard() {
  const { balance } = useBalance()
  const { couple } = useCouple()
  const [hidden, setHidden] = useState(false)

  const display = hidden ? '••••••' : formatMoney(balance, couple?.currency ?? 'EUR')

  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-6 text-white shadow-xl shadow-brand-900/30 sm:p-7"
      aria-label="Saldo disponible"
    >
      {/* Decorative rings */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/10"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-white/70">
            Nuestro dinero
          </p>
          <button
            type="button"
            onClick={() => setHidden((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
          >
            {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {hidden ? 'Mostrar saldo' : 'Ocultar saldo'}
          </button>
        </div>

        <p
          className="mt-3 font-display text-[2.6rem] font-semibold leading-none tracking-tight tabular-nums sm:text-5xl"
          data-testid="balance-amount"
        >
          {display}
        </p>
        <p className="mt-2 text-sm text-white/70">Dinero disponible</p>
      </div>
    </section>
  )
}
