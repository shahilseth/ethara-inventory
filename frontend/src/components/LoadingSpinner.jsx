export default function LoadingSpinner() {
  return (
    <div>
      {[0, 1, 2].map((i) => (
        <div key={i}>
          <div className="h-[52px] bg-[var(--color-surface-card)] rounded-[var(--radius-sm)] animate-pulse" />
          {i < 2 && <div className="h-px bg-[var(--color-hairline)]" />}
        </div>
      ))}
    </div>
  )
}
