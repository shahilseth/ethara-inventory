import { useState } from 'react'
import Modal from './Modal.jsx'

const CONFIRM_CLASSES = {
  danger:  'border border-[var(--color-error)] text-[var(--color-error)] hover:bg-[rgba(198,69,69,0.06)]',
  warning: 'border border-[var(--color-warning)] text-[var(--color-warning)] hover:bg-[rgba(212,160,23,0.06)]',
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
}) {
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="420px">
      <p className="text-[14px] text-[var(--color-muted)] mb-6">{message}</p>
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-[14px] font-medium text-[var(--color-muted)] rounded-[var(--radius-md)] hover:bg-[var(--color-surface-card)] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className={`px-4 py-2 text-[14px] font-medium rounded-[var(--radius-md)] bg-transparent transition-colors disabled:opacity-50 ${CONFIRM_CLASSES[variant]}`}
        >
          {loading ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
