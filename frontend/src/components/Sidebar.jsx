import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Users, X } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products',  icon: Package,         label: 'Products' },
  { to: '/customers', icon: Users,           label: 'Customers' },
  { to: '/orders',    icon: ShoppingBag,     label: 'Orders' },
]

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) =>
        isActive ? { borderLeft: '2px solid var(--color-primary)' } : {}
      }
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-[var(--radius-md)] mx-2 my-[2px] px-4 py-[10px] min-h-[44px] text-[14px] font-medium transition-colors ${
          isActive
            ? 'bg-[var(--color-surface-cream-strong)] text-[var(--color-ink)]'
            : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-card)] hover:text-[var(--color-ink)]'
        }`
      }
    >
      <Icon size={20} />
      {label}
    </NavLink>
  )
}

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: 'rgba(20,20,19,0.5)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full bg-[var(--color-surface-soft)] border-r border-[var(--color-hairline)] z-50 flex flex-col transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ width: 'min(280px, 85vw)' }}
      >
        {/* Logo */}
        <div className="h-[64px] flex items-center justify-between px-5 border-b border-[var(--color-hairline)] shrink-0">
          <div className="flex items-center gap-3">
            {/* Package + upward arrow icon */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              style={{ color: 'var(--color-primary)', flexShrink: 0 }}
            >
              {/* Box body */}
              <rect x="4" y="12" width="20" height="13" rx="2"
                stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
              {/* Box lid line */}
              <path d="M4 12h20"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              {/* Box flaps */}
              <path d="M10 12V9h8v3"
                stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
              {/* Upward arrow inside box */}
              <path d="M14 21v-5"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M11.5 18.5L14 16l2.5 2.5"
                stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[15px] font-semibold text-[var(--color-ink)]">StockFlow</span>
          </div>

          {/* X close button — mobile only */}
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="md:hidden w-[44px] h-[44px] flex items-center justify-center rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-card)] text-[var(--color-muted)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-4 shrink-0">
          <span className="text-[12px] text-[var(--color-muted-soft)]">v1.0</span>
        </div>
      </aside>
    </>
  )
}
