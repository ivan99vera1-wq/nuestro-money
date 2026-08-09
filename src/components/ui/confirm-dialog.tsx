import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div
          className={
            danger
              ? 'grid h-14 w-14 place-items-center rounded-2xl bg-expense-50 dark:bg-expense-950/40 text-expense-600'
              : 'grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600'
          }
        >
          <AlertTriangle className="h-7 w-7" />
        </div>
        <p className="text-sm text-ink-2">{message}</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
