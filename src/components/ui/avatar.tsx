import { cn } from '@/utils/cn'

interface AvatarProps {
  name?: string | null | undefined
  size?: 'sm' | 'md' | 'lg' | undefined
  className?: string | undefined
}

const SIZES = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' }

const GRADIENTS = [
  'from-brand-500 to-brand-700',
  'from-violet-500 to-violet-700',
  'from-sky-500 to-sky-700',
  'from-amber-500 to-amber-600',
]

function initials(name?: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

function hash(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i)
  return Math.abs(h)
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const gradient = GRADIENTS[hash(name ?? '?') % GRADIENTS.length]!
  return (
    <div
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-semibold text-white',
        gradient,
        SIZES[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  )
}
