/**
 * Notifications service — internal, couple-scoped messages in plural
 * ("Habéis alcanzado vuestro objetivo…").
 */

import { supabase } from '@/services/supabase/client'
import type { NotificationRow } from '@/types/database'

export interface NotificationsResult {
  error: string | null
  notifications: NotificationRow[]
}

export async function listNotifications(coupleId: string): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data ?? []
}

export async function unreadCount(coupleId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('couple_id', coupleId)
    .is('read_at', null)
  if (error) return 0
  return count ?? 0
}

export async function markAsRead(coupleId: string, id: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('couple_id', coupleId)
}

export async function markAllAsRead(coupleId: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('couple_id', coupleId)
    .is('read_at', null)
}
