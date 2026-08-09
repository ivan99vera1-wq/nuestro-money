/**
 * Domain models used across the application.
 * These are the shapes consumed by UI components and hooks after the
 * service layer has fetched/normalised data from Supabase.
 */

import type { TransactionType } from '@/config/constants'
import type {
  BudgetRow,
  CoupleMemberRole,
  CoupleRow,
  CoupleMemberRow,
  InviteRow,
  NotificationRow,
  ProfileRow,
  SavingsGoalRow,
  TransactionRow,
  TransactionTypeRow,
} from '@/types/database'

export type { TransactionType }

export interface Profile extends ProfileRow {}

export interface Couple extends CoupleRow {}

export interface CoupleMember extends CoupleMemberRow {}

/** A transaction enriched with the display profile of who created it. */
export interface Transaction extends TransactionRow {
  created_by_profile?: Profile | null
}

export interface SavingsGoal extends SavingsGoalRow {}

export interface Budget extends BudgetRow {}

export interface AppNotification extends NotificationRow {}

export interface Invite extends InviteRow {}

export type { CoupleMemberRole, TransactionTypeRow }

/**
 * The shared economy is always owned by both members together.
 * `id` of the member who performed an action is used for audit only.
 */
export interface BalanceSnapshot {
  /** Total in minor units. */
  balance: number
  income: number
  expense: number
}

export interface MonthlySummary {
  month: string
  income: number
  expense: number
  balance: number
}

export interface TransactionFilters {
  type: TransactionType | 'all'
  category: string | 'all'
  from: string | null
  to: string | null
  query: string
}

export type SavingsGoalStatus = 'on-track' | 'achieved' | 'behind'

/** Goal progress computed by the app layer. */
export interface GoalWithProgress extends SavingsGoal {
  progress: number
  remaining: number
  status: SavingsGoalStatus
}
