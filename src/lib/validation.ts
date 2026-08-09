/**
 * Shared validation helpers. Return an error message or null.
 * The backend re-validates everything (RLS + SQL triggers); this layer
 * only gives the user immediate feedback.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'El email es obligatorio.'
  if (!EMAIL_RE.test(email.trim())) return 'Introduce un email válido.'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'La contraseña es obligatoria.'
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.'
  return null
}

export function validateRequired(value: string, label: string): string | null {
  if (!value.trim()) return `${label} es obligatorio.`
  return null
}

export function validateAmount(cents: number | null | undefined): string | null {
  if (cents === null || cents === undefined || Number.isNaN(cents)) {
    return 'Introduce una cantidad válida.'
  }
  if (cents <= 0) return 'La cantidad debe ser mayor que cero.'
  return null
}
