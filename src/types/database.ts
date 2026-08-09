/**
 * Hand-written Supabase database types.
 *
 * These mirror `supabase/migrations/0000_init.sql`. Keep both files in
 * sync. (Regenerating automatically with `supabase gen types` requires
 * CLI access to the project and is documented in DATABASE.md.)
 *
 * Money columns are `bigint` minor units. Never floats.
 */

export type ProfileRow = {
  id: string
  full_name: string | null
  avatar_url: string | null
  currency: string
  created_at: string
  updated_at: string
}

export type CoupleRow = {
  id: string
  name: string
  currency: string
  invite_code: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type CoupleMemberRole = 'owner' | 'member'

export type CoupleMemberRow = {
  id: string
  couple_id: string
  user_id: string
  role: CoupleMemberRole
  joined_at: string
}

export type TransactionTypeRow = 'income' | 'expense'

export type TransactionRow = {
  id: string
  couple_id: string
  type: TransactionTypeRow
  /** Integer minor units (cents). Non-null, enforced in DB. */
  amount: number
  category: string
  description: string
  /** Business date (YYYY-MM-DD). Distinct from created_at. */
  date: string
  note: string | null
  /** Audit only — never used for balances. */
  created_by: string
  created_at: string
  updated_by: string | null
  updated_at: string | null
  deleted_at: string | null
}

export type CategoryRow = {
  id: string
  type: TransactionTypeRow
  key: string
  label: string
  icon: string
  color: string
  sort_order: number
}

export type BudgetRow = {
  id: string
  couple_id: string
  category: string
  /** Monthly cap in integer minor units. */
  limit_amount: number
  created_at: string
  updated_at: string
}

export type SavingsGoalRow = {
  id: string
  couple_id: string
  name: string
  /** Virtual allocation target — never creates money. */
  target_amount: number
  /** Virtual progress — purely informational, never touches balance. */
  current_amount: number
  target_date: string | null
  icon: string | null
  color: string | null
  created_by: string
  created_at: string
  updated_by: string | null
  updated_at: string | null
}

export type NotificationTypeRow =
  | 'transaction'
  | 'goal'
  | 'budget'
  | 'invite'
  | 'system'

export type NotificationRow = {
  id: string
  couple_id: string
  user_id: string | null
  type: NotificationTypeRow
  title: string
  body: string
  icon: string | null
  read_at: string | null
  created_at: string
}

export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'cancelled'

export type InviteRow = {
  id: string
  couple_id: string
  inviter_id: string
  email: string
  token: string
  status: InviteStatus
  created_at: string
  expires_at: string
  accepted_by: string | null
  accepted_at: string | null
}

/** Row shape returned by `get_couple_stats`. */
export type CoupleStats = {
  member_count: number
  first_name: string | null
  second_name: string | null
}

/** Row shape returned by `get_balance`. */
export type BalanceResult = {
  balance: number
  income: number
  expense: number
}
