import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  UserPlus,
} from 'lucide-react'
import { BalanceCard } from '@/components/cards/balance-card'
import { TransactionCard } from '@/components/cards/transaction-card'
import { GoalCard } from '@/components/cards/goal-card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { InlineLoader } from '@/components/ui/loading'
import { useCouple } from '@/contexts/CoupleContext'
import { useAllTransactions } from '@/features/stats/useAllTransactions'
import { useGoals } from '@/hooks/useGoals'
import { buildGreeting } from '@/lib/greeting'
import { computeSummary } from '@/features/stats/aggregate'
import {
  monthRange,
  startOfPreviousMonthISO,
  endOfPreviousMonthISO,
} from '@/lib/calendar'
import { formatMoney, formatSigned, formatPercent } from '@/lib/format'

export function DashboardPage() {
  const navigate = useNavigate()
  const { greetingNames, couple, isComplete } = useCouple()
  const { transactions, loading } = useAllTransactions()
  const { goals } = useGoals()

  const currency = couple?.currency ?? 'EUR'
  const greeting = buildGreeting(greetingNames)

  const { from: curFrom, to: curTo } = monthRange()
  const current = computeSummary(
    transactions.filter((t) => t.date >= curFrom && t.date <= curTo),
  )
  const previous = computeSummary(
    transactions.filter(
      (t) =>
        t.date >= startOfPreviousMonthISO() && t.date <= endOfPreviousMonthISO(),
    ),
  )

  const recent = transactions.slice(0, 5)
  const goalPreview = goals.slice(0, 3)

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {greeting}
        </h1>
        <p className="mt-1 text-sm text-ink-2">
          Este es vuestro dinero, todo en un mismo lugar.
        </p>
      </div>

      {/* Couple incomplete banner */}
      {!isComplete && (
        <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800 dark:border-brand-900 dark:bg-brand-950/40 dark:text-brand-200">
          <UserPlus className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <div className="flex-1">
            <p className="font-semibold">
              Invitad a vuestra pareja para compartir esta cuenta.
            </p>
            <p className="mt-0.5 text-xs opacity-80">
              Cuando acepte la invitación, ambos veréis exactamente el mismo dinero.
            </p>
          </div>
          <Link
            to="/invite-partner"
            className="shrink-0 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Invitar
          </Link>
        </div>
      )}

      <BalanceCard />

      {/* Monthly summary */}
      <section className="rounded-3xl border border-line bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-ink">Este mes</h2>
          <Link
            to="/stats"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 dark:text-brand-400"
          >
            Estadísticas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <SummaryCell
            label="Ingresos"
            value={`+${formatMoney(current.income, currency)}`}
            tone="income"
          />
          <SummaryCell
            label="Gastos"
            value={`−${formatMoney(current.expense, currency)}`}
            tone="expense"
          />
          <SummaryCell
            label="Balance"
            value={formatSigned(current.balance, currency)}
            tone={current.balance >= 0 ? 'income' : 'expense'}
          />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-3">Ahorro del mes</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-ink">
              {formatMoney(Math.max(0, current.balance), currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-3">% ahorro</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-brand-600">
              {current.savingsRate === null ? '—' : formatPercent(current.savingsRate)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-3">Vs mes anterior</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-ink-2">
              {formatSigned(current.balance - previous.balance, currency)}
            </p>
          </div>
        </div>
      </section>

      {/* Goals preview */}
      {goalPreview.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Nuestros objetivos</h2>
            <Link
              to="/goals"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 dark:text-brand-400"
            >
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-3">
            {goalPreview.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      )}

      {/* Recent transactions */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-ink">Movimientos recientes</h2>
          <Link
            to="/transactions"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 dark:text-brand-400"
          >
            Ver todos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <InlineLoader />
        ) : recent.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-7 w-7" />}
            title="Todavía no tenéis movimientos"
            description="Empezad registrando vuestro primer ingreso o gasto."
            action={
              <Button onClick={() => navigate('/add/income')} leftIcon={<ArrowDownLeft className="h-4 w-4" />}>
                Añadir dinero
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onClick={() => navigate(`/transactions/${tx.id}`)}
              />
            ))}
            {transactions.length > 5 && (
              <Button
                variant="ghost"
                fullWidth
                onClick={() => navigate('/transactions')}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Ver todos los movimientos
              </Button>
            )}
          </div>
        )}
      </section>

      {/* Quick actions (desktop helper) */}
      <div className="hidden gap-3 lg:flex">
        <Button variant="secondary" fullWidth onClick={() => navigate('/add/income')} leftIcon={<ArrowDownLeft className="h-4 w-4" />}>
          Añadir dinero
        </Button>
        <Button variant="danger" fullWidth onClick={() => navigate('/add/expense')} leftIcon={<ArrowUpRight className="h-4 w-4" />}>
          Registrar gasto
        </Button>
      </div>
    </div>
  )
}

function SummaryCell({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'income' | 'expense'
}) {
  return (
    <div className="rounded-2xl bg-surface-2/70 px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-3">{label}</p>
      <p
        className={
          tone === 'income'
            ? 'mt-0.5 text-sm font-semibold tabular-nums text-income-600 dark:text-income-400'
            : 'mt-0.5 text-sm font-semibold tabular-nums text-expense-600 dark:text-expense-400'
        }
      >
        {value}
      </p>
    </div>
  )
}
