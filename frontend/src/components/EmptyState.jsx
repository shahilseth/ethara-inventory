export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="min-h-[240px] flex flex-col items-center justify-center gap-3 text-center px-4">
      {Icon && <Icon size={40} className="text-[var(--color-muted-soft)]" />}
      <div>
        <p className="text-[16px] font-medium text-[var(--color-ink)]">{title}</p>
        {description && (
          <p className="text-[14px] text-[var(--color-muted)] mt-1">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 text-[14px] font-medium text-[var(--color-on-dark)] bg-[var(--color-primary)] rounded-[var(--radius-md)] hover:bg-[var(--color-primary-active)] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
