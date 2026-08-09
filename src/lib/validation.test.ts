import { describe, expect, it } from 'vitest'
import { validateAmount, validateEmail, validatePassword, validateRequired } from '@/lib/validation'

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('xiomara@nuestro.app')).toBeNull()
    expect(validateEmail('ivan+tag@nuestro.app')).toBeNull()
  })

  it('rejects empty and malformed emails', () => {
    expect(validateEmail('')).toBe('El email es obligatorio.')
    expect(validateEmail('   ')).toBe('El email es obligatorio.')
    expect(validateEmail('ivan@')).toMatch(/válido/)
    expect(validateEmail('@nuestro.app')).toMatch(/válido/)
  })
})

describe('validatePassword', () => {
  it('accepts passwords of at least 6 chars', () => {
    expect(validatePassword('123456')).toBeNull()
  })

  it('rejects empty and short passwords', () => {
    expect(validatePassword('')).toBe('La contraseña es obligatoria.')
    expect(validatePassword('12345')).toMatch(/al menos 6/)
  })
})

describe('validateRequired', () => {
  it('rejects blank values with the label', () => {
    expect(validateRequired('  ', 'El nombre')).toBe('El nombre es obligatorio.')
    expect(validateRequired('Nuestro Money', 'El nombre')).toBeNull()
  })
})

describe('validateAmount', () => {
  it('accepts positive amounts in minor units', () => {
    expect(validateAmount(1)).toBeNull()
    expect(validateAmount(999999999)).toBeNull()
  })

  it('rejects zero, negative, NaN and null', () => {
    expect(validateAmount(0)).toMatch(/mayor que cero/)
    expect(validateAmount(-5)).toMatch(/mayor que cero/)
    expect(validateAmount(Number.NaN)).toMatch(/válida/)
    expect(validateAmount(null)).toMatch(/válida/)
    expect(validateAmount(undefined)).toMatch(/válida/)
  })
})
