/**
 * Date helpers (thin wrappers over date-fns returning ISO strings).
 * All date math for reports lives here so the rest of the app stays pure.
 */

import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfDay,
  format,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns'

export const toISODate = (d: Date): string => format(d, 'yyyy-MM-dd')
export const toISODateTime = (d: Date): string => d.toISOString()

export const todayISO = (): string => toISODate(new Date())

export function startOfMonthISO(d: Date = new Date()): string {
  return toISODate(startOfMonth(d))
}

export function endOfMonthISO(d: Date = new Date()): string {
  return toISODate(endOfMonth(d))
}

export function startOfPreviousMonthISO(d: Date = new Date()): string {
  return toISODate(startOfMonth(subMonths(d, 1)))
}

export function endOfPreviousMonthISO(d: Date = new Date()): string {
  return toISODate(endOfMonth(subMonths(d, 1)))
}

export function daysAgoISO(days: number): string {
  return toISODate(subDays(new Date(), days))
}

export function monthsAgoISO(months: number): string {
  return toISODate(subMonths(new Date(), months))
}

/** Array of ISO dates from `fromISO` to `toISO` inclusive. */
export function eachDayISO(fromISO: string, toISO: string): string[] {
  const from = startOfDay(new Date(`${fromISO}T00:00:00`))
  const to = endOfDay(new Date(`${toISO}T00:00:00`))
  return eachDayOfInterval({ start: from, end: to }).map(toISODate)
}

/** Inclusive ISO range for a whole month. */
export function monthRange(d: Date = new Date()): { from: string; to: string } {
  return { from: startOfMonthISO(d), to: endOfMonthISO(d) }
}

export function addMonthsISO(dateISO: string, months: number): string {
  return toISODate(addMonths(new Date(`${dateISO}T00:00:00`), months))
}

export function addDaysISO(dateISO: string, days: number): string {
  return toISODate(addDays(new Date(`${dateISO}T00:00:00`), days))
}

export function monthLabel(dateISO: string): string {
  return format(new Date(`${dateISO}T00:00:00`), 'MMMM yyyy')
}
