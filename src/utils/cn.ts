/** Tiny `classnames`-style helper to merge conditional class strings. */

export type ClassValue = string | number | null | undefined | false

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
