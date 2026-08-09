/**
 * Money arithmetic.
 *
 * Financial integrity rule:
 *   SALDO = INGRESOS − GASTOS
 *
 * All monetary amounts are stored and computed as INTEGER MINOR UNITS
 * (cents for EUR/USD/GBP, whole units for PYG/COP). This avoids the
 * floating-point precision traps of JavaScript (0.1 + 0.2 !== 0.3).
 *
 * Never store amounts as float in the database or in calculations.
 */

import { CURRENCIES, DEFAULT_CURRENCY } from '@/config/constants'

const getDigits = (currency: string): number =>
  CURRENCIES.find((c) => c.code === currency)?.digits ?? 2

/**
 * Parse a human amount string into integer minor units.
 *
 * Accepts "10,50", "10.50", "1050", "1.234,56" (es-ES) and "1,234.56" (en-US).
 * The input is normalised: only the last occurrence of the decimal
 * separator wins. Returns NaN for invalid input.
 */
export function parseAmountToCents(input: string, currency = DEFAULT_CURRENCY): number {
  const digits = getDigits(currency)
  const cleaned = input.trim().replace(/[^\d.,-]/g, '')

  if (cleaned === '' || cleaned === '-' || cleaned === ',' || cleaned === '.') {
    return Number.NaN
  }

  const negative = cleaned.startsWith('-')
  const body = negative ? cleaned.slice(1) : cleaned

  // Zero-decimal currencies (COP, PYG): every separator is a thousands
  // separator and the value is already in minor units.
  if (digits === 0) {
    const n = Number.parseInt(body.replace(/[.,]/g, ''), 10)
    if (Number.isNaN(n)) return Number.NaN
    return negative ? -n : n
  }

  const lastDot = body.lastIndexOf('.')
  const lastComma = body.lastIndexOf(',')
  const separator = Math.max(lastDot, lastComma)

  if (separator === -1) {
    const n = Number.parseInt(body, 10)
    if (Number.isNaN(n)) return Number.NaN
    const cents = n * 10 ** digits
    return negative ? -cents : cents
  }

  const integerPart = body.slice(0, separator).replace(/[.,]/g, '')
  const decimalPart = body.slice(separator + 1).replace(/[.,]/g, '').slice(0, digits)

  const intValue = Number.parseInt(integerPart || '0', 10)
  const decValue = Number.parseInt(decimalPart.padEnd(digits, '0'), 10)

  const cents = intValue * 10 ** digits + decValue
  return (negative ? -cents : cents) || 0
}

/** Convert integer minor units into a safe float for charting only. */
export function centsToAmount(cents: number): number {
  return cents / 100
}

/** Total minor units of a list of transactions, signed by type. */
export function sumSigned(transactions: { type: 'income' | 'expense'; amount: number }[]): number {
  return transactions.reduce(
    (acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount),
    0,
  )
}

/** Signed contribution of a single transaction to the balance. */
export function signedAmount(type: 'income' | 'expense', amountCents: number): number {
  return type === 'income' ? amountCents : -amountCents
}
