import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { Wordmark } from '@/components/ui/logo'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/hooks/useNotifications'

export function TopBar() {
  const { profile } = useAuth()
  const { unread } = useNotifications()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line/60 bg-canvas/80 px-4 py-3 backdrop-blur-lg lg:hidden">
      <Wordmark />
      <div className="flex items-center gap-2">
        <Link
          to="/notifications"
          aria-label="Notificaciones"
          className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-2 transition-colors hover:bg-surface-2"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-expense-500 px-1 text-[9px] font-bold text-white">
              {unread}
            </span>
          )}
        </Link>
        <Link to="/profile" aria-label="Perfil">
          <Avatar name={profile?.full_name} size="sm" />
        </Link>
      </div>
    </header>
  )
}
