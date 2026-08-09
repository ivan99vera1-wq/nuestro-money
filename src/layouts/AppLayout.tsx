import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/top-bar'
import { BottomNavigation } from '@/components/layout/bottom-navigation'

/**
 * Layout for authenticated users who belong to a couple.
 * Desktop: fixed sidebar + content. Mobile: top bar + bottom nav + FAB.
 */
export function AppLayout() {
  return (
    <div className="min-h-dvh bg-canvas">
      <Sidebar />
      <div className="lg:pl-64">
        <TopBar />
        <main className="mx-auto w-full max-w-5xl px-4 pb-32 pt-4 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">
          <Outlet />
        </main>
      </div>
      <BottomNavigation />
    </div>
  )
}
