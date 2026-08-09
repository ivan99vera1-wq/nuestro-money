import { describe, expect, it } from 'vitest'
import {
  centsToAmount,
  parseAmountToCents,
  signedAmount,
  sumSigned,
} from '@/lib/money'

describe('parseAmountToCents', () => {
  it('parses es-ES decimal input', () => {
    expect(parseAmountToCents('10,50')).toBe(1050)
    expect(parseAmountToCents('0,99')).toBe(99)
    expect(parseAmountToCents('1050')).toBe(105000)
  })

  it('parses en-US decimal input', () => {
    expect(parseAmountToCents('10.50')).toBe(1050)
    expect(parseAmountToCents('1,234.56')).toBe(123456)
  })

  it('parses thousands separators in es-ES', () => {
    expect(parseAmountToCents('1.234,56')).toBe(123456)
  })

  it('handles negative values', () => {
    expect(parseAmountToCents('-10,50')).toBe(-1050)
  })

  it('rounds/truncates beyond the currency digits', () => {
    expect(parseAmountToCents('10,999')).toBe(1099)
  })

  it('returns NaN for invalid input', () => {
    expect(parseAmountToCents('')).toBeNaN()
    expect(parseAmountToCents('abc')).toBeNaN()
    expect(parseAmountToCents('--')).toBeNaN()
  })

  it('parses zero-currency values (COP, PYG) without decimals', () => {
    expect(parseAmountToCents('1.500', 'COP')).toBe(1500)
  })
})

describe('sumSigned', () => {
  it('computes SALDO = INGRESOS - GASTOS', () => {
    const transactions = [
      { type: 'income' as const, amount: 150000 },
      { type: 'income' as const, amount: 30000 },
      { type: 'expense' as const, amount: 8500 },
      { type: 'expense' as const, amount: 6000 },
    ]
    expect(sumSigned(transactions)).toBe(165500)
  })

  it('returns 0 for empty lists', () => {
    expect(sumSigned([])).toBe(0)
  })
})

describe('signedAmount', () => {
  it('signs amounts by type', () => {
    expect(signedAmount('income', 150000)).toBe(150000)
    expect(signedAmount('expense', 8500)).toBe(-8500)
  })
})

describe('centsToAmount', () => {
  it('converts minor units to a float for charts only', () => {
    expect(centsToAmount(1050)).toBe(10.5)
  })
})
