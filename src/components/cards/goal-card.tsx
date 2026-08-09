import { useNavigate } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import type { GoalWithProgress } from '@/types/domain'
import { Card } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Badge } from '@/components/ui/badge'
import { formatMoney, formatPercent } from '@/lib/format'
import { useCouple } from '@/contexts/CoupleContext'

interface GoalCardProps {
  goal: GoalWithProgress
}

export function GoalCard({ goal }: GoalCardProps) {
  const navigate = useNavigate()
  const { couple } = useCouple()
  const currency = couple?.currency ?? 'EUR'
  const achieved = goal.status === 'achieved'

  return (
    <Card
      interactive
      onClick={() => navigate(`/goals/${goal.id}`)}
      className="cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-ink">{goal.name}</p>
            <p className="mt-0.5 text-xs text-ink-3">
              {formatMoney(goal.current_amount, currency)} / {formatMoney(goal.target_amount, currency)}
            </p>
          </div>
        </div>
        {achieved && <Badge tone="brand">✓ Logrado</Badge>}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <ProgressBar value={goal.progress} tone={achieved ? 'income' : 'brand'} className="flex-1" />
        <span className="text-xs font-semibold tabular-nums text-ink-2">
          {formatPercent(goal.progress)}
        </span>
      </div>
    </Card>
  )
}
