/**
 * Savings goals service.
 *
 * IMPORTANT: goals are VIRTUAL allocations. Updating `current_amount`
 * never touches the shared balance. They represent a mental reservation
 * over the existing pool of money.
 */

import { supabase } from '@/services/supabase/client'
import type { SavingsGoalRow } from '@/types/database'
import type { GoalWithProgress, SavingsGoalStatus } from '@/types/domain'

export interface GoalResult {
  error: string | null
  goal?: SavingsGoalRow | undefined
}

export async function listGoals(coupleId: string): Promise<SavingsGoalRow[]> {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createGoal(input: {
  coupleId: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
  icon?: string
  color?: string
}): Promise<GoalResult> {
  const { data, error } = await supabase
    .from('savings_goals')
    .insert({
      couple_id: input.coupleId,
      name: input.name.trim(),
      target_amount: input.targetAmount,
      current_amount: input.currentAmount,
      target_date: input.targetDate ?? null,
      icon: input.icon ?? null,
      color: input.color ?? null,
    })
    .select('*')
    .maybeSingle()
  if (error) return { error: error.message }
  return { error: null, goal: data ?? undefined }
}

export async function updateGoal(
  coupleId: string,
  id: string,
  patch: Partial<
    Pick<SavingsGoalRow, 'name' | 'target_amount' | 'current_amount' | 'target_date' | 'icon' | 'color'>
  >,
): Promise<GoalResult> {
  const { data, error } = await supabase
    .from('savings_goals')
    .update(patch)
    .eq('id', id)
    .eq('couple_id', coupleId)
    .select('*')
    .maybeSingle()
  if (error) return { error: error.message }
  return { error: null, goal: data ?? undefined }
}

export async function deleteGoal(coupleId: string, id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', id)
    .eq('couple_id', coupleId)
  return { error: error?.message ?? null }
}

/** Compute progress for a list of goals. */
export function withProgress(goals: SavingsGoalRow[]): GoalWithProgress[] {
  return goals.map((goal) => {
    const progress = goal.target_amount > 0 ? goal.current_amount / goal.target_amount : 0
    const status: SavingsGoalStatus =
      progress >= 1 ? 'achieved' : progress >= 0.5 ? 'on-track' : 'behind'
    return {
      ...goal,
      progress: Math.min(1, progress),
      remaining: Math.max(0, goal.target_amount - goal.current_amount),
      status,
    }
  })
}
