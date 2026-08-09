/**
 * Supabase `Database` generic type (mirrors `supabase gen types` output).
 * Kept hand-written and in sync with `supabase/migrations/0000_init.sql`
 * until CLI access to the project is available.
 */

import type {
  BalanceResult,
  BudgetRow,
  CategoryRow,
  CoupleMemberRow,
  CoupleRow,
  CoupleStats,
  InviteRow,
  NotificationRow,
  ProfileRow,
  SavingsGoalRow,
  TransactionRow,
} from '@/types/database'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: Pick<ProfileRow, 'id' | 'full_name'> & Partial<ProfileRow>
        Update: Partial<ProfileRow>
        Relationships: []
      }
      couples: {
        Row: CoupleRow
        Insert: Partial<CoupleRow>
        Update: Partial<CoupleRow>
        Relationships: []
      }
      couple_members: {
        Row: CoupleMemberRow
        Insert: Partial<CoupleMemberRow>
        Update: Partial<CoupleMemberRow>
        Relationships: []
      }
      categories: {
        Row: CategoryRow
        Insert: CategoryRow
        Update: Partial<CategoryRow>
        Relationships: []
      }
      transactions: {
        Row: TransactionRow
        Insert: Partial<TransactionRow>
        Update: Partial<TransactionRow>
        Relationships: []
      }
      budgets: {
        Row: BudgetRow
        Insert: Partial<BudgetRow>
        Update: Partial<BudgetRow>
        Relationships: []
      }
      savings_goals: {
        Row: SavingsGoalRow
        Insert: Partial<SavingsGoalRow>
        Update: Partial<SavingsGoalRow>
        Relationships: []
      }
      notifications: {
        Row: NotificationRow
        Insert: Partial<NotificationRow>
        Update: Partial<NotificationRow>
        Relationships: []
      }
      invites: {
        Row: InviteRow
        Insert: Partial<InviteRow>
        Update: Partial<InviteRow>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_couple: {
        Args: { _name: string; _currency?: string }
        Returns: string
      }
      invite_partner: {
        Args: { _email: string }
        Returns: undefined
      }
      accept_invite: {
        Args: { _token: string }
        Returns: string
      }
      get_balance: {
        Args: { _couple_id: string }
        Returns: BalanceResult
      }
      get_couple_stats: {
        Args: { _couple_id: string }
        Returns: CoupleStats
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
