/**
 * Formatting helpers built on the Intl API so every locale/currency
 * combination renders correctly without extra dependencies.
 */

import { CURRENCIES, DEFAULT_CURRENCY } from '@/config/constants'

const getDigits = (currency: string): number =>
  CURRENCIES.find((c) => c.code === currency)?.digits ?? 2

const getSymbol = (currency: string): string =>
  CURRENCIES.find((c) => c.code === currency)?.symbol ?? '€'

const esLocale = (): string | undefined =>
  typeof navigator !== 'undefined' && navigator.language?.startsWith('es')
    ? 'es'
    : undefined

/**
 * Format integer minor units as a human amount.
 * formatMoney(1050, 'EUR') → "€10,50"
 */
export function formatMoney(cents: number, currency = DEFAULT_CURRENCY): string {
  const digits = getDigits(currency)
  const symbol = getSymbol(currency)
  const locale = esLocale()
  const number = (cents / 10 ** digits).toLocaleString(locale ?? 'es-ES', {
    minimumFractionDigits: digits > 0 ? 2 : 0,
    maximumFractionDigits: digits > 0 ? 2 : 0,
    // es-ES only groups from 5 digits by default; force grouping so the
    // shared balance always reads like "€4.850,00".
    useGrouping: 'always',
  })
  return `${symbol}${number}`
}

/** Signed variant: formatMoneySigned(1050) → "+€10,50", (-850) → "-€8,50" */
export function formatSigned(cents: number, currency = DEFAULT_CURRENCY): string {
  const sign = cents > 0 ? '+' : cents < 0 ? '-' : ''
  return `${sign}${formatMoney(Math.abs(cents), currency)}`
}

/** Short compact amount for chart axes: formatMoneyCompact(1_234_500) → "€1,2k" */
export function formatMoneyCompact(cents: number, currency = DEFAULT_CURRENCY): string {
  const digits = getDigits(currency)
  const symbol = getSymbol(currency)
  const value = cents / 10 ** digits
  const number = Intl.NumberFormat('es-ES', {
    notation: 'compact',
    maximumFractionDigits: 1,
  })
    .format(value)
    .replace(/\u00a0/g, ' ')
  return `${symbol}${number}`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function formatMonthYear(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
}

export function formatPercent(ratio: number): string {
  if (!Number.isFinite(ratio)) return '—'
  return `${Math.round(ratio * 100)}%`
}

/** Clamp helper for progress bars (0..1). */
export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}
