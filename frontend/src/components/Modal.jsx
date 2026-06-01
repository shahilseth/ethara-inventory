import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, maxWidth = '480px' }) {
  const modalRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement
    document.body.style.overflow = 'hidden'

    const modal = modalRef.current
    const focusable = modal?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusable?.[0]?.focus()

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab' || !focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      previouslyFocused?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    // Mobile: flex-col justify-end → modal slides up from bottom
    // Desktop: flex-row items-center justify-center → modal is centered
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end md:flex-row md:items-center md:justify-center md:p-4"
      style={{ backgroundColor: 'rgba(20,20,19,0.5)' }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="
          w-full
          rounded-t-[16px] md:rounded-[var(--radius-xl)]
          max-h-[90vh] overflow-y-auto
          bg-[var(--color-canvas)]
          p-6 md:p-8
          border border-[var(--color-hairline)]
        "
        style={{ maxWidth, WebkitOverflowScrolling: 'touch' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <h2
            className="text-[24px] md:text-[28px] font-normal text-[var(--color-ink)] tracking-[-0.3px] leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-[44px] h-[44px] md:w-8 md:h-8 flex items-center justify-center rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-card)] text-[var(--color-muted)] transition-colors shrink-0 ml-4"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
