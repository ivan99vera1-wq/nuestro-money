import { useCallback, useEffect, useMemo, useState } from 'react'
import * as notificationsService from '@/services/api/notifications'
import type { NotificationRow } from '@/types/database'
import { useCouple } from '@/contexts/CoupleContext'

interface NotificationsState {
  notifications: NotificationRow[]
  unread: number
  loading: boolean
  refresh: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

export function useNotifications(): NotificationsState {
  const { couple } = useCouple()
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!couple) {
      setNotifications([])
      setUnread(0)
      setLoading(false)
      return
    }
    try {
      const [items, count] = await Promise.all([
        notificationsService.listNotifications(couple.id),
        notificationsService.unreadCount(couple.id),
      ])
      setNotifications(items)
      setUnread(count)
    } catch {
      setNotifications([])
      setUnread(0)
    } finally {
      setLoading(false)
    }
  }, [couple])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const markRead = useCallback(
    async (id: string) => {
      if (!couple) return
      await notificationsService.markAsRead(couple.id, id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id && !n.read_at ? { ...n, read_at: new Date().toISOString() } : n)),
      )
      setUnread((u) => Math.max(0, u - 1))
    },
    [couple],
  )

  const markAllRead = useCallback(async () => {
    if (!couple) return
    await notificationsService.markAllAsRead(couple.id)
    const now = new Date().toISOString()
    setNotifications((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })))
    setUnread(0)
  }, [couple])

  return useMemo(
    () => ({ notifications, unread, loading, refresh, markRead, markAllRead }),
    [notifications, unread, loading, refresh, markRead, markAllRead],
  )
}
