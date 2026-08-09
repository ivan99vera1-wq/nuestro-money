import { describe, expect, it } from 'vitest'
import {
  buildBalanceSeries,
  categoryBreakdown,
  computeAnnualSummary,
  computeSummary,
} from '@/features/stats/aggregate'
import type { TransactionRow } from '@/types/database'

function tx(partial: Partial<TransactionRow> & Pick<TransactionRow, 'date' | 'type' | 'amount'>): TransactionRow {
  return {
    id: 'id',
    couple_id: 'couple',
    category: 'other',
    description: '',
    note: null,
    created_by: 'u1',
    created_at: '2026-08-01T00:00:00.000Z',
    updated_by: null,
    updated_at: null,
    deleted_at: null,
    ...partial,
  }
}

describe('computeSummary', () => {
  it('computes income, expense, balance and savings rate', () => {
    const summary = computeSummary([
      tx({ date: '2026-08-01', type: 'income', amount: 150000 }),
      tx({ date: '2026-08-02', type: 'expense', amount: 50000 }),
    ])
    expect(summary.income).toBe(150000)
    expect(summary.expense).toBe(50000)
    expect(summary.balance).toBe(100000)
    expect(summary.savingsRate).toBeCloseTo(2 / 3)
  })

  it('returns null savings rate when there is no income', () => {
    const summary = computeSummary([tx({ date: '2026-08-01', type: 'expense', amount: 50000 })])
    expect(summary.savingsRate).toBeNull()
    expect(summary.balance).toBe(-50000)
  })

  it('returns zeros for empty input', () => {
    expect(computeSummary([])).toEqual({ income: 0, expense: 0, balance: 0, savingsRate: null })
  })
})

describe('buildBalanceSeries', () => {
  it('seeds from history and carries the balance forward', () => {
    const history = [
      tx({ date: '2026-07-31', type: 'income', amount: 100000 }),
      tx({ date: '2026-08-01', type: 'expense', amount: 20000 }),
    ]
    const series = buildBalanceSeries(history, '2026-08-01', '2026-08-03')
    expect(series).toEqual([
      { label: '01', balance: 80000 },
      { label: '02', balance: 80000 },
      { label: '03', balance: 80000 },
    ])
  })

  it('ignores transactions after the range end', () => {
    const history = [
      tx({ date: '2026-08-01', type: 'income', amount: 100000 }),
      tx({ date: '2026-09-01', type: 'expense', amount: 90000 }),
    ]
    const series = buildBalanceSeries(history, '2026-08-01', '2026-08-02')
    expect(series[0]!.balance).toBe(100000)
    expect(series[1]!.balance).toBe(100000)
  })

  it('returns zero balances when there is no history', () => {
    const series = buildBalanceSeries([], '2026-08-01', '2026-08-01')
    expect(series).toEqual([{ label: '01', balance: 0 }])
  })
})

describe('categoryBreakdown', () => {
  it('groups expenses by category, sorted desc with palette', () => {
    const breakdown = categoryBreakdown(
      [
        tx({ date: '2026-08-01', type: 'expense', amount: 3000, category: 'food' }),
        tx({ date: '2026-08-02', type: 'expense', amount: 5000, category: 'home' }),
        tx({ date: '2026-08-03', type: 'expense', amount: 1000, category: 'food' }),
        tx({ date: '2026-08-04', type: 'income', amount: 99999, category: 'salary' }),
      ],
      ['#111111', '#222222'],
    )
    expect(breakdown).toEqual([
      { name: 'home', value: 5000, color: '#111111' },
      { name: 'food', value: 4000, color: '#222222' },
    ])
  })

  it('returns an empty list when there are no expenses', () => {
    expect(categoryBreakdown([tx({ date: '2026-08-01', type: 'income', amount: 100 })], ['#fff'])).toEqual([])
  })
})

describe('computeAnnualSummary', () => {
  const history = [
    tx({ date: '2026-01-05', type: 'income', amount: 200000 }),
    tx({ date: '2026-01-20', type: 'expense', amount: 50000, category: 'food' }),
    tx({ date: '2026-02-10', type: 'income', amount: 100000 }),
    tx({ date: '2026-02-15', type: 'expense', amount: 90000, category: 'home' }),
    tx({ date: '2025-12-01', type: 'income', amount: 999999 }),
  ]

  it('computes totals, best/worst month and top category for the year', () => {
    const summary = computeAnnualSummary(history, '2026')
    expect(summary.totalIncome).toBe(300000)
    expect(summary.totalExpense).toBe(140000)
    expect(summary.totalSaved).toBe(160000)
    expect(summary.avgMonthlyIncome).toBe(150000)
    expect(summary.avgMonthlyExpense).toBe(70000)
    expect(summary.bestMonth).toEqual({ key: '2026-01', balance: 150000 })
    expect(summary.worstMonth).toEqual({ key: '2026-02', expense: 90000 })
    expect(summary.topCategory).toEqual({ category: 'home', amount: 90000 })
  })

  it('ignores transactions from other years', () => {
    const summary = computeAnnualSummary(history, '2025')
    expect(summary.totalIncome).toBe(999999)
    expect(summary.bestMonth).toEqual({ key: '2025-12', balance: 999999 })
  })

  it('returns nulls for an empty year', () => {
    const summary = computeAnnualSummary([], '2030')
    expect(summary.totalIncome).toBe(0)
    expect(summary.bestMonth).toBeNull()
    expect(summary.topCategory).toBeNull()
  })
})
