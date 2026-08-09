import { Link } from 'react-router-dom'
import { Plus, Trophy } from 'lucide-react'
import { GoalCard } from '@/components/cards/goal-card'
import { EmptyState } from '@/components/ui/empty-state'
import { InlineLoader } from '@/components/ui/loading'
import { useGoals } from '@/hooks/useGoals'

export function GoalsPage() {
  const { goals, loading } = useGoals()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Objetivos</h1>
        <Link
          to="/goals/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition-colors hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Nuevo
        </Link>
      </div>

      <p className="text-sm text-ink-2">
        Reservas mentales sobre vuestro dinero. No crean ni mueven saldo.
      </p>

      {loading ? (
        <InlineLoader />
      ) : goals.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-7 w-7" />}
          title="Todavía no tenéis objetivos"
          description="Cread vuestro primer objetivo: una casa, un viaje, un coche… lo que queráis conseguir juntos."
          action={
            <Link
              to="/goals/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> Crear objetivo
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  )
}
