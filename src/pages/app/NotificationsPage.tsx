import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  BellOff,
  CheckCheck,
  Target,
  AlertTriangle,
  Users,
} from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { InlineLoader } from '@/components/ui/loading'
import { useNotifications } from '@/hooks/useNotifications'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/utils/cn'

const TYPE_META: Record<string, { icon: React.ReactNode; tint: string }> = {
  transaction_income: { icon: <ArrowUpRight className="h-4 w-4" />, tint: 'bg-income-100 text-income-600 dark:bg-income-950/50 dark:text-income-400' },
  transaction_expense: { icon: <ArrowDownLeft className="h-4 w-4" />, tint: 'bg-expense-100 text-expense-600 dark:bg-expense-950/50 dark:text-expense-400' },
  goal: { icon: <Target className="h-4 w-4" />, tint: 'bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400' },
  budget: { icon: <AlertTriangle className="h-4 w-4" />, tint: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' },
  invite: { icon: <Users className="h-4 w-4" />, tint: 'bg-brand-100 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400' },
  system: { icon: <Bell className="h-4 w-4" />, tint: 'bg-surface-3 text-ink-2' },
}

const FALLBACK_META = { icon: <Bell className="h-4 w-4" />, tint: 'bg-surface-3 text-ink-2' }

export function NotificationsPage() {
  const { notifications, unread, loading, markRead, markAllRead } = useNotifications()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Notificaciones</h1>
        {unread > 0 && (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400"
          >
            <CheckCheck className="h-4 w-4" /> Marcar todo
          </button>
        )}
      </div>

      {loading ? (
        <InlineLoader />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<BellOff className="h-7 w-7" />}
          title="Sin notificaciones"
          description="Aquí veréis avisos de movimientos, objetivos y presupuestos."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => {
            const meta = TYPE_META[n.type] ?? FALLBACK_META
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => void markRead(n.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-left transition-colors',
                  !n.read_at && 'border-brand-300/60 bg-brand-50/40 dark:border-brand-900 dark:bg-brand-950/20',
                )}
              >
                <span className={cn('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full', meta.tint)}>
                  {meta.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">{n.title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-ink-2">{n.body}</span>
                  <span className="mt-1.5 block text-xs text-ink-3">
                    {formatDateTime(new Date(n.created_at))}
                  </span>
                </span>
                {!n.read_at && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
