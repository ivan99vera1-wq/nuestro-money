import { cn } from '@/utils/cn'
import { Spinner } from '@/components/ui/button'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-surface-2', className)} />
}

export function LoadingScreen({ label }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas">
      <Spinner className="h-8 w-8 text-brand-600" />
      {label && <p className="text-sm text-ink-2">{label}</p>}
    </div>
  )
}

export function InlineLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex justify-center py-10', className)}>
      <Spinner className="h-6 w-6 text-brand-600" />
    </div>
  )
}
