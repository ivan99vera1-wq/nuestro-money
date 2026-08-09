import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildGreeting } from '@/lib/greeting'

afterEach(() => {
  vi.useRealTimers()
})

function atTime(iso: string) {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(iso))
}

describe('buildGreeting', () => {
  it('uses "e" before a name starting with i/hi', () => {
    atTime('2026-08-09T10:00:00')
    expect(buildGreeting(['Xiomara', 'Iván'])).toContain('Buenos días, Xiomara e Iván 👋')
  })

  it('uses "y" otherwise', () => {
    atTime('2026-08-09T10:00:00')
    expect(buildGreeting(['Xiomara', 'Andrés'])).toContain('Buenos días, Xiomara y Andrés 👋')
  })

  it('greets a single person', () => {
    atTime('2026-08-09T14:00:00')
    expect(buildGreeting(['Xiomara'])).toBe('Buenas tardes, Xiomara 👋')
  })

  it('greets without names', () => {
    atTime('2026-08-09T21:00:00')
    expect(buildGreeting([])).toBe('Buenas noches 👋')
  })

  it('picks the time-of-day part', () => {
    atTime('2026-08-09T08:00:00')
    expect(buildGreeting([])).toContain('Buenos días')
    atTime('2026-08-09T15:00:00')
    expect(buildGreeting([])).toContain('Buenas tardes')
    atTime('2026-08-09T22:00:00')
    expect(buildGreeting([])).toContain('Buenas noches')
  })
})
