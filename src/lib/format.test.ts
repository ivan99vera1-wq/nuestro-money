import { describe, expect, it } from 'vitest'
import {
  clamp01,
  formatDate,
  formatMoney,
  formatMoneyCompact,
  formatPercent,
  formatSigned,
} from '@/lib/format'

describe('formatMoney', () => {
  it('formats EUR minor units with symbol', () => {
    expect(formatMoney(1050)).toBe('€10,50')
    expect(formatMoney(0)).toBe('€0,00')
    expect(formatMoney(150000)).toBe('€1.500,00')
  })

  it('supports zero-decimal currencies', () => {
    expect(formatMoney(1500, 'COP')).toBe('$1.500')
  })
})

describe('formatSigned', () => {
  it('adds + for income and - for expense', () => {
    expect(formatSigned(1050)).toBe('+€10,50')
    expect(formatSigned(-850)).toBe('-€8,50')
    expect(formatSigned(0)).toBe('€0,00')
  })
})

describe('formatMoneyCompact', () => {
  it('compacts large amounts for chart axes', () => {
    expect(formatMoneyCompact(1_234_500)).toBe('€12,3 mil')
  })
})

describe('formatPercent', () => {
  it('formats ratios as percentages', () => {
    expect(formatPercent(0.66)).toBe('66%')
    expect(formatPercent(0.8)).toBe('80%')
    expect(formatPercent(Number.NaN)).toBe('—')
  })
})

describe('clamp01', () => {
  it('clamps values to the unit interval', () => {
    expect(clamp01(-0.2)).toBe(0)
    expect(clamp01(0.66)).toBe(0.66)
    expect(clamp01(1.4)).toBe(1)
    expect(clamp01(Number.NaN)).toBe(0)
  })
})

describe('formatDate', () => {
  it('formats dates in es-ES', () => {
    expect(formatDate('2026-08-08')).toContain('agosto')
    expect(formatDate('2026-08-08')).toContain('2026')
  })
})
