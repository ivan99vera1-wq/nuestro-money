import { useNavigate } from 'react-router-dom'
import { ChevronRight, LogOut, Heart } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCouple } from '@/contexts/CoupleContext'
import { useToast } from '@/contexts/ToastContext'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/utils/cn'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const { couple, members, greetingNames } = useCouple()
  const { toast } = useToast()
  const { theme, toggleTheme } = useTheme()
  const [confirmOut, setConfirmOut] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const onSignOut = async () => {
    setSigningOut(true)
    await signOut()
    setSigningOut(false)
    toast.success('Hasta pronto.')
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Perfil</h1>

      {/* Identity */}
      <Card padded className="flex items-center gap-4">
        <Avatar name={profile?.full_name} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold text-ink">
            {profile?.full_name ?? 'Miembro'}
          </p>
          <p className="truncate text-sm text-ink-2">{user?.email}</p>
        </div>
      </Card>

      {/* Couple */}
      <Card padded>
        <p className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
          <Heart className="h-4 w-4 text-rose-500" /> {couple?.name ?? 'Mi pareja'}
        </p>
        <p className="mt-1 text-sm text-ink-2">
          {greetingNames.length > 0
            ? greetingNames.join(' e ')
            : members.map((m) => m.profiles?.full_name ?? 'Miembro').filter(Boolean).join(' e ')}
        </p>
      </Card>

      {/* Settings rows */}
      <Card padded={false} className="divide-y divide-line">
        <SettingsRow
          label="Apariencia"
          value={theme === 'dark' ? 'Oscuro' : 'Claro'}
          onClick={toggleTheme}
        />
        <SettingsRow label="Preferencias" value="Moneda y más" onClick={() => navigate('/settings')} withChevron />
      </Card>

      <button
        type="button"
        onClick={() => setConfirmOut(true)}
        className="flex items-center justify-center gap-2 rounded-2xl border border-expense-200 bg-expense-50/50 px-4 py-3 text-sm font-semibold text-expense-600 transition-colors hover:bg-expense-50 dark:border-expense-900/60 dark:bg-expense-950/30 dark:text-expense-400"
      >
        <LogOut className="h-4 w-4" /> Cerrar sesión
      </button>

      <ConfirmDialog
        open={confirmOut}
        title="¿Cerrar sesión?"
        message="Podréis volver a entrar cuando queráis."
        confirmLabel="Sí, cerrar sesión"
        loading={signingOut}
        onConfirm={() => void onSignOut()}
        onCancel={() => setConfirmOut(false)}
      />
    </div>
  )
}

function SettingsRow({
  label,
  value,
  onClick,
  withChevron,
}: {
  label: string
  value: string
  onClick: () => void
  withChevron?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-surface-2/60"
    >
      <span className="text-sm font-medium text-ink">{label}</span>
      <span className={cn('flex items-center gap-1 text-sm text-ink-2')}>
        {value}
        {withChevron && <ChevronRight className="h-4 w-4" />}
      </span>
    </button>
  )
}
