/**
 * App-wide constants: categories, currencies, limits.
 * Centralised here so the UI, validation and DB defaults stay in sync.
 */

export type TransactionType = 'income' | 'expense'

export const TRANSACTION_TYPES: readonly TransactionType[] = ['income', 'expense']

export interface Category {
  /** Stable unique key. Persisted in the DB. */
  key: string
  /** Human-readable label shown in the UI. */
  label: string
  /** Lucide icon name used across the app. */
  icon: string
  /** Tailwind-ish semantic color token applied to the icon chip. */
  color: string
}

/** Categories available for income (ingresos). */
export const INCOME_CATEGORIES: readonly Category[] = [
  { key: 'salary', label: 'Salario', icon: 'briefcase', color: 'income' },
  { key: 'savings', label: 'Ahorro', icon: 'piggy-bank', color: 'brand' },
  { key: 'gift', label: 'Regalo', icon: 'gift', color: 'violet' },
  { key: 'refund', label: 'Devolución', icon: 'rotate-ccw', color: 'sky' },
  { key: 'business', label: 'Negocio', icon: 'store', color: 'amber' },
  { key: 'sale', label: 'Venta', icon: 'tag', color: 'teal' },
  { key: 'other', label: 'Otro', icon: 'more-horizontal', color: 'slate' },
]

/** Categories available for expenses (gastos). */
export const EXPENSE_CATEGORIES: readonly Category[] = [
  { key: 'food', label: 'Comida', icon: 'utensils', color: 'orange' },
  { key: 'supermarket', label: 'Supermercado', icon: 'shopping-cart', color: 'brand' },
  { key: 'transport', label: 'Transporte', icon: 'bus', color: 'sky' },
  { key: 'home', label: 'Casa', icon: 'home', color: 'brown' },
  { key: 'travel', label: 'Viajes', icon: 'plane', color: 'violet' },
  { key: 'leisure', label: 'Ocio', icon: 'clapperboard', color: 'pink' },
  { key: 'shopping', label: 'Compras', icon: 'shopping-bag', color: 'amber' },
  { key: 'gifts', label: 'Regalos', icon: 'gift', color: 'rose' },
  { key: 'health', label: 'Salud', icon: 'heart-pulse', color: 'red' },
  { key: 'business', label: 'Negocio', icon: 'store', color: 'teal' },
  { key: 'other', label: 'Otros', icon: 'more-horizontal', color: 'slate' },
]

export const ALL_CATEGORIES: readonly Category[] = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
]

/** All supported currencies. EUR is the primary currency. */
export interface Currency {
  code: string
  symbol: string
  name: string
  /** ISO 4217 minor units (0 = none, 2 = cents). */
  digits: number
}

export const CURRENCIES: readonly Currency[] = [
  { code: 'EUR', symbol: '€', name: 'Euro', digits: 2 },
  { code: 'USD', symbol: '$', name: 'Dólar estadounidense', digits: 2 },
  { code: 'COP', symbol: '$', name: 'Peso colombiano', digits: 0 },
  { code: 'PYG', symbol: '₲', name: 'Guaraní paraguayo', digits: 0 },
  { code: 'GBP', symbol: '£', name: 'Libra esterlina', digits: 2 },
]

export const DEFAULT_CURRENCY = 'EUR'

/** Couple limits */
export const COUPLE = {
  maxMembers: 2,
  maxNameLength: 60,
}

/** Transaction limits */
export const TRANSACTION = {
  /** Max amount accepted, in minor units (€ 9.999.999,99). */
  maxAmountCents: 999_999_999,
  maxDescriptionLength: 120,
  maxNoteLength: 500,
}

/** Goal limits */
export const GOAL = {
  maxNameLength: 60,
  maxTargetCents: 999_999_999,
}

/** Budget limits */
export const BUDGET = {
  maxNameLength: 60,
  maxLimitCents: 999_999_999,
}

/** Number formatting rules for EUR amounts used across charts/labels. */
export const NEGATIVE_SALDO_PREVENTION = true
