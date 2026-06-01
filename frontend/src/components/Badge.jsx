const VARIANTS = {
  'in-stock':    { bg: 'bg-[rgba(93,184,166,0.12)]',  text: 'text-[var(--color-accent-teal)]',  label: 'In stock' },
  'low-stock':   { bg: 'bg-[rgba(232,165,90,0.12)]',  text: 'text-[var(--color-accent-amber)]', label: 'Low stock' },
  'out-of-stock':{ bg: 'bg-[rgba(198,69,69,0.10)]',   text: 'text-[var(--color-error)]',        label: 'Out of stock' },
  'confirmed':   { bg: 'bg-[rgba(93,184,118,0.12)]',  text: 'text-[var(--color-success)]',      label: 'Confirmed' },
  'cancelled':   { bg: 'bg-[rgba(198,69,69,0.10)]',   text: 'text-[var(--color-error)]',        label: 'Cancelled' },
}

export default function Badge({ variant }) {
  const v = VARIANTS[variant] ?? VARIANTS['confirmed']
  return (
    <span
      className={`inline-flex items-center ${v.bg} ${v.text} rounded-[var(--radius-pill)] px-[10px] py-[4px] text-[12px] font-medium`}
    >
      {v.label}
    </span>
  )
}
