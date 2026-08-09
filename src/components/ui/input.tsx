import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/utils/cn'

interface FieldWrapProps {
  label?: string | undefined
  error?: string | undefined
  hint?: string | undefined
  children: ReactNode
}

export function Field({ label, error, hint, children }: FieldWrapProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="px-1 text-xs font-medium uppercase tracking-wide text-ink-2">{label}</span>
      )}
      {children}
      {error ? (
        <span className="px-1 text-xs font-medium text-expense-600">{error}</span>
      ) : hint ? (
        <span className="px-1 text-xs text-ink-3">{hint}</span>
      ) : null}
    </label>
  )
}

const baseField =
  'w-full rounded-xl border border-line bg-surface-2/60 px-4 text-sm text-ink placeholder:text-ink-3 transition-colors focus:border-brand-500 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500/25'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string | undefined
  error?: string | undefined
  hint?: string | undefined
  trailing?: ReactNode | undefined
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, trailing, className, id, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <Field label={label} error={error} hint={hint}>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          className={cn(baseField, 'h-12', Boolean(trailing) && 'pr-11', Boolean(error) && 'border-expense-400', className)}
          {...rest}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-3 flex items-center text-ink-3">{trailing}</div>
        )}
      </div>
    </Field>
  )
})

interface PasswordInputProps extends Omit<InputProps, 'type' | 'trailing'> {}

export function PasswordInput({ className, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  return (
    <Input
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="text-ink-3 transition-colors hover:text-ink"
        >
          {visible ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
        </button>
      }
      className={className}
      {...rest}
    />
  )
}

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(baseField, 'min-h-24 py-3 resize-none', className)} {...rest} />
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string | undefined
  error?: string | undefined
  hint?: string | undefined
  options: { value: string; label: string; disabled?: boolean }[]
}

export function Select({ label, error, hint, options, className, ...rest }: SelectProps) {
  return (
    <Field label={label} error={error} hint={hint}>
      <select
        className={cn(baseField, 'h-12 appearance-none bg-no-repeat pr-10', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238a9890' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundPosition: 'right 0.9rem center',
        }}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
