import { Menu } from 'lucide-react'

export default function Topbar({ title, onMenuClick }) {
  return (
    <div className="h-[64px] bg-[var(--color-canvas)] border-b border-[var(--color-hairline)] flex items-center px-4 md:px-6 gap-2">
      {/* Hamburger — mobile only, left-aligned */}
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="md:hidden w-[44px] h-[44px] flex items-center justify-center rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-card)] text-[var(--color-ink)] transition-colors shrink-0"
      >
        <Menu size={20} />
      </button>

      {/* Title — centered on mobile, left on desktop */}
      <span className="flex-1 text-[18px] font-semibold text-[var(--color-ink)] text-center md:text-left truncate">
        {title}
      </span>

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-[var(--color-surface-card)] flex items-center justify-center shrink-0">
        <span className="text-[13px] font-medium text-[var(--color-muted)]">EU</span>
      </div>
    </div>
  )
}
