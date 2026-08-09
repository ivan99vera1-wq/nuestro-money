import { NavLink } from 'react-router-dom'
import {
  House,
  ArrowLeftRight,
  Target,
  ChartPie,
  Wallet,
  CalendarDays,
  Bell,
  Settings,
  User,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Wordmark } from '@/components/ui/logo'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { useCouple } from '@/contexts/CoupleContext'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export const MAIN_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Inicio', icon: House, end: true },
  { to: '/transactions', label: 'Movimientos', icon: ArrowLeftRight },
  { to: '/goals', label: 'Objetivos', icon: Target },
  { to: '/stats', label: 'Estadísticas', icon: ChartPie },
]

export const MORE_NAV: NavItem[] = [
  { to: '/budgets', label: 'Presupuestos', icon: Wallet },
  { to: '/calendar', label: 'Calendario', icon: CalendarDays },
  { to: '/notifications', label: 'Notificaciones', icon: Bell },
  { to: '/settings', label: 'Configuración', icon: Settings },
  { to: '/profile', label: 'Perfil', icon: User },
]

interface NavLinkRowProps {
  item: NavItem
  badge?: number
  onClick?: () => void
}

export function NavLinkRow({ item, badge, onClick }: NavLinkRowProps) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      {...(item.end ? { end: true } : {})}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
            : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
        )
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {badge ? (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-expense-500 px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </NavLink>
  )
}

export function Sidebar() {
  const { signOut } = useAuth()
  const { profile } = useAuth()
  const { couple } = useCouple()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface px-4 py-5 lg:flex">
      <div className="px-2 pb-6">
        <Wordmark />
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {MAIN_NAV.map((item) => (
          <NavLinkRow key={item.to} item={item} />
        ))}
        <p className="mt-6 px-3.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Organización
        </p>
        {MORE_NAV.slice(0, 3).map((item) => (
          <NavLinkRow key={item.to} item={item} />
        ))}
        <p className="mt-6 px-3.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Cuenta
        </p>
        <NavLinkRow item={MORE_NAV[3]!} />
        <NavLinkRow item={MORE_NAV[4]!} />
      </nav>

      <div className="mt-4 border-t border-line pt-4">
        <div className="flex items-center gap-3 px-2">
          <Avatar name={profile?.full_name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">
              {profile?.full_name || 'Sin nombre'}
            </p>
            <p className="truncate text-xs text-ink-3">
              {couple?.name ?? 'Cuenta compartida'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            aria-label="Cerrar sesión"
            className="text-ink-3 transition-colors hover:text-expense-500"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
