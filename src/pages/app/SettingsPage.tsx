import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Download, Moon, Sun } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useCouple } from '@/contexts/CoupleContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useToast } from '@/contexts/ToastContext'
import { updateProfile } from '@/services/api/auth'
import { CURRENCIES } from '@/config/constants'
import { validatePassword, validateRequired } from '@/lib/validation'
import { cn } from '@/utils/cn'

export function SettingsPage() {
  const { user, profile, refreshProfile, updatePassword } = useAuth()
  const { couple } = useCouple()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const [name, setName] = useState(profile?.full_name ?? '')
  const [nameError, setNameError] = useState<string | undefined>(undefined)
  const [savingName, setSavingName] = useState(false)

  const [currency, setCurrency] = useState(couple?.currency ?? profile?.currency ?? 'EUR')
  const [savingCurrency, setSavingCurrency] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined)
  const [savingPassword, setSavingPassword] = useState(false)

  const saveName = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    const err = validateRequired(name, 'El nombre')
    setNameError(err ?? undefined)
    if (err) return
    setSavingName(true)
    try {
      await refreshProfile()
      await updateProfile(user.id, { full_name: name.trim() })
      toast.success('Nombre actualizado.')
    } catch {
      toast.error('No se pudo actualizar el nombre.')
    } finally {
      setSavingName(false)
    }
  }

  const saveCurrency = async (code: string) => {
    if (!user) return
    setCurrency(code)
    setSavingCurrency(true)
    try {
      await updateProfile(user.id, { currency: code })
      toast.success('Moneda actualizada.')
    } catch {
      toast.error('No se pudo actualizar la moneda.')
      setCurrency(couple?.currency ?? profile?.currency ?? 'EUR')
    } finally {
      setSavingCurrency(false)
    }
  }

  const changePassword = async (e: FormEvent) => {
    e.preventDefault()
    const err = validatePassword(newPassword)
    setPasswordError(err ?? undefined)
    if (err) return
    setSavingPassword(true)
    const result = await updatePassword(newPassword)
    setSavingPassword(false)
    if (result.error) {
      setPasswordError(result.error)
      return
    }
    setNewPassword('')
    toast.success('Contraseña actualizada.')
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Configuración</h1>

      {/* Appearance */}
      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-ink-2">
          Apariencia
        </h2>
        <Card padded className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} Tema
          </span>
          <div className="flex rounded-xl bg-surface-2 p-1">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                theme === 'light' ? 'bg-surface text-ink shadow-sm' : 'text-ink-2',
              )}
            >
              Claro
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                theme === 'dark' ? 'bg-surface text-ink shadow-sm' : 'text-ink-2',
              )}
            >
              Oscuro
            </button>
          </div>
        </Card>
      </section>

      {/* Currency */}
      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-ink-2">
          Preferencias
        </h2>
        <Card padded>
          <Select
            label="Moneda de la pareja"
            options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.symbol} · ${c.name} (${c.code})` }))}
            value={currency}
            onChange={(e) => void saveCurrency(e.target.value)}
            disabled={savingCurrency}
          />
          <p className="mt-2 text-xs leading-relaxed text-ink-3">
            La moneda es común para toda la pareja y se usa al registrar movimientos.
          </p>
        </Card>
      </section>

      {/* Account */}
      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-ink-2">Cuenta</h2>
        <Card padded>
          <form onSubmit={saveName} className="flex flex-col gap-3" noValidate>
            <Input
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={nameError}
              maxLength={60}
            />
            <Button type="submit" size="sm" loading={savingName} className="self-start">
              Guardar nombre
            </Button>
          </form>

          <form onSubmit={changePassword} className="mt-6 flex flex-col gap-3 border-t border-line pt-5" noValidate>
            <Input
              label="Nueva contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={passwordError}
              autoComplete="new-password"
            />
            <Button type="submit" size="sm" variant="secondary" loading={savingPassword} className="self-start">
              Cambiar contraseña
            </Button>
          </form>
        </Card>
      </section>

      {/* Data */}
      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-ink-2">Datos</h2>
        <Card padded={false} className="divide-y divide-line">
          <Link
            to="/settings/export"
            className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-surface-2/60"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-ink">
              <Download className="h-4 w-4 text-ink-3" /> Exportar movimientos
            </span>
            <ChevronRight className="h-4 w-4 text-ink-3" />
          </Link>
        </Card>
      </section>

      <p className="pb-2 text-center text-xs text-ink-3">
        NUESTRO MONEY · v1.0.0
      </p>
    </div>
  )
}
