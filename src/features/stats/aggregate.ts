/**
 * Pure aggregation functions for statistics and reports.
 * These are deterministic and unit-tested (no I/O).
 */

import type { TransactionRow } from '@/types/database'
import { eachDayISO } from '@/lib/calendar'
import { signedAmount } from '@/lib/money'

export interface MonthSummary {
  income: number
  expense: number
  balance: number
  /** balance/income; null when there is no income. */
  savingsRate: number | null
}

export function computeSummary(transactions: TransactionRow[]): MonthSummary {
  let income = 0
  let expense = 0
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }
  const balance = income - expense
  return { income, expense, balance, savingsRate: income > 0 ? balance / income : null }
}

export interface DayPoint {
  label: string
  balance: number
}

/**
 * Daily running balance from `fromISO` to `toISO` inclusive.
 * Requires the full transaction history to seed the initial balance.
 */
export function buildBalanceSeries(
  transactions: TransactionRow[],
  fromISO: string,
  toISO: string,
): DayPoint[] {
  const days = eachDayISO(fromISO, toISO)

  const sorted = [...transactions]
    .filter((t) => t.date <= toISO)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

  const balanceByDay = new Map<string, number>()
  let running = 0
  for (const t of sorted) {
    running += signedAmount(t.type, t.amount)
    if (t.date >= fromISO) {
      balanceByDay.set(t.date, running)
    }
  }

  // Carry the last known balance forward; if no history at all the balance is 0.
  return days.map((day) => {
    const balance = balanceByDay.get(day) ?? lastBalanceBefore(balanceByDay, day, running)
    return { label: day.slice(8), balance }
  })
}

function lastBalanceBefore(
  map: Map<string, number>,
  day: string,
  fallback: number,
): number {
  let best: number | null = null
  let bestKey = ''
  for (const [k, v] of map) {
    if (k < day && (bestKey === '' || k > bestKey)) {
      bestKey = k
      best = v
    }
  }
  return best ?? fallback
}

/** Group expenses by category with a fixed color palette. */
export function categoryBreakdown(
  transactions: TransactionRow[],
  palette: string[],
): { name: string; value: number; color: string }[] {
  const byCategory = new Map<string, number>()
  for (const t of transactions) {
    if (t.type === 'expense') {
      byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount)
    }
  }
  return [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({
      name,
      value,
      color: palette[index % palette.length]!,
    }))
}

export interface AnnualSummary {
  totalIncome: number
  totalExpense: number
  totalSaved: number
  avgMonthlyIncome: number | null
  avgMonthlyExpense: number | null
  bestMonth: { key: string; balance: number } | null
  worstMonth: { key: string; expense: number } | null
  topCategory: { category: string; amount: number } | null
}

export function computeAnnualSummary(
  transactions: TransactionRow[],
  year: string,
): AnnualSummary {
  const yearTxs = transactions.filter((t) => t.date.startsWith(year))

  const byMonth = new Map<string, { income: number; expense: number }>()
  const byCategory = new Map<string, number>()

  let totalIncome = 0
  let totalExpense = 0

  for (const t of yearTxs) {
    const monthKey = t.date.slice(0, 7)
    const bucket = byMonth.get(monthKey) ?? { income: 0, expense: 0 }
    if (t.type === 'income') {
      totalIncome += t.amount
      bucket.income += t.amount
    } else {
      totalExpense += t.amount
      bucket.expense += t.amount
      byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount)
    }
    byMonth.set(monthKey, bucket)
  }

  const months = [...byMonth.entries()]

  const bestMonth = months
    .map(([key, b]) => ({ key, balance: b.income - b.expense }))
    .sort((a, b) => b.balance - a.balance)[0] ?? null

  const worstMonth = months
    .map(([key, b]) => ({ key, expense: b.expense }))
    .sort((a, b) => b.expense - a.expense)[0] ?? null

  const topCategoryEntry = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0] ?? null
  const topCategory = topCategoryEntry ? { category: topCategoryEntry[0], amount: topCategoryEntry[1] } : null

  const totalSaved = totalIncome - totalExpense
  const monthCount = months.length

  return {
    totalIncome,
    totalExpense,
    totalSaved,
    avgMonthlyIncome: monthCount > 0 ? totalIncome / monthCount : null,
    avgMonthlyExpense: monthCount > 0 ? totalExpense / monthCount : null,
    bestMonth,
    worstMonth,
    topCategory,
  }
}
