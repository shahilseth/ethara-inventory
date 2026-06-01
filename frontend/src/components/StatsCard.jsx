export default function StatsCard({ icon: Icon, label, value, accent = false }) {
  const isHighlighted = accent && typeof value === 'number' && value > 0

  return (
    <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-lg)] p-[var(--space-xl)] border border-[var(--color-hairline)] shadow-[var(--shadow-card)]">
      <div className="w-10 h-10 rounded-full bg-[var(--color-surface-cream-strong)] flex items-center justify-center mb-4">
        <Icon size={20} className="text-[var(--color-muted)]" />
      </div>
      <div
        className={`text-[36px] font-normal tracking-[-0.5px] leading-none ${
          isHighlighted ? 'text-[var(--color-accent-amber)]' : 'text-[var(--color-ink)]'
        }`}
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {value}
      </div>
      <div className="text-[14px] text-[var(--color-muted)] mt-[4px]">{label}</div>
    </div>
  )
}
