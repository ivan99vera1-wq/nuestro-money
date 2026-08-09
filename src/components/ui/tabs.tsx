import { cn } from '@/utils/cn'

export interface TabItem<T extends string> {
  value: T
  label: string
}

interface TabsProps<T extends string> {
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function Tabs<T extends string>({ items, value, onChange, className }: TabsProps<T>) {
  return (
    <div
      className={cn(
        'flex gap-1 rounded-xl bg-surface-2 p-1',
        className,
      )}
      role="tablist"
    >
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          aria-selected={value === item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all',
            value === item.value
              ? 'bg-surface text-ink shadow-sm'
              : 'text-ink-3 hover:text-ink-2',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
