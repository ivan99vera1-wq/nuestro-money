import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { MoreHorizontal, Plus, ArrowDownLeft, ArrowUpRight, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { MAIN_NAV, MORE_NAV, NavLinkRow } from '@/components/layout/sidebar'
import { Modal } from '@/components/ui/modal'

export function BottomNavigation() {
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)

  return (
    <>
      {/* Floating action button */}
      <div className="fixed bottom-24 right-5 z-40 flex flex-col items-end gap-2 lg:hidden">
        {fabOpen && (
          <div className="flex flex-col items-end gap-2 animate-sheet-up">
            <FabAction
              label="Crear objetivo"
              icon={<Target className="h-4.5 w-4.5" />}
              onClick={() => {
                setFabOpen(false)
                navigate('/goals/new')
              }}
            />
            <FabAction
              label="Registrar gasto"
              icon={<ArrowUpRight className="h-4.5 w-4.5" />}
              onClick={() => {
                setFabOpen(false)
                navigate('/add/expense')
              }}
            />
            <FabAction
              label="Añadir dinero"
              icon={<ArrowDownLeft className="h-4.5 w-4.5" />}
              onClick={() => {
                setFabOpen(false)
                navigate('/add/income')
              }}
            />
          </div>
        )}
        <button
          type="button"
          onClick={() => setFabOpen((v) => !v)}
          aria-label="Acciones rápidas"
          className={cn(
            'grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-xl shadow-brand-600/30 transition-transform active:scale-95',
            fabOpen && 'rotate-45',
          )}
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>

      {/* Bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-lg lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5">
          {MAIN_NAV.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                {...(item.end ? { end: true } : {})}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition-colors',
                    isActive ? 'text-brand-600' : 'text-ink-3',
                  )
                }
              >
                <Icon className="h-5.5 w-5.5" />
                {item.label}
              </NavLink>
            )
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium text-ink-3"
          >
            <MoreHorizontal className="h-5.5 w-5.5" />
            Más
          </button>
        </div>
      </nav>

      {/* More sheet */}
      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="Más">
        <div className="flex flex-col gap-1">
          {MORE_NAV.map((item) => (
            <NavLinkRow
              key={item.to}
              item={item}
              onClick={() => setMoreOpen(false)}
            />
          ))}
        </div>
      </Modal>
    </>
  )
}

function FabAction({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border border-line bg-surface py-2.5 pl-3 pr-4 text-sm font-medium text-ink shadow-lg"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-surface-2 text-brand-600">
        {icon}
      </span>
      {label}
    </button>
  )
}
