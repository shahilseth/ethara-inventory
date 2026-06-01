import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, Package, ShoppingBag, Users } from 'lucide-react'

import { getCustomers } from '../api/customers.js'
import { getOrders } from '../api/orders.js'
import { getProducts } from '../api/products.js'
import Badge from '../components/Badge.jsx'
import EmptyState from '../components/EmptyState.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import StatsCard from '../components/StatsCard.jsx'

function stockBadgeVariant(qty) {
  return qty === 0 ? 'out-of-stock' : 'low-stock'
}

function stockQtyClass(qty) {
  if (qty < 5)  return 'text-[var(--color-error)]'
  if (qty < 10) return 'text-[var(--color-accent-amber)]'
  return 'text-[var(--color-body)]'
}

const TABLE_COLS = ['PRODUCT NAME', 'SKU', 'IN STOCK', 'STATUS']

export default function Dashboard() {
  const [products,  setProducts]  = useState([])
  const [customers, setCustomers] = useState([])
  const [orders,    setOrders]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    Promise.all([getProducts(), getCustomers(), getOrders()])
      .then(([p, c, o]) => { setProducts(p); setCustomers(c); setOrders(o) })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const lowStockItems = products.filter((p) => p.quantity < 10)

  if (loading) return <LoadingSpinner />

  if (error) return (
    <div className="rounded-[var(--radius-md)] bg-[rgba(198,69,69,0.08)] text-[var(--color-error)] text-[14px] px-5 py-4">
      {error}
    </div>
  )

  return (
    <div>
      {/* Stats grid — 1 col mobile, 2 col sm, 4 col lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard icon={Package}       label="Total products"  value={products.length} />
        <StatsCard icon={Users}         label="Total customers" value={customers.length} />
        <StatsCard icon={ShoppingBag}   label="Total orders"    value={orders.length} />
        <StatsCard icon={AlertTriangle} label="Low stock items" value={lowStockItems.length} accent />
      </div>

      {/* Low stock section */}
      <div style={{ marginTop: '40px' }}>
        <div className="flex items-center gap-3">
          <h2 className="text-[18px] font-semibold text-[var(--color-ink)]">Low stock alerts</h2>
          {lowStockItems.length > 0 && (
            <span className="bg-[rgba(232,165,90,0.12)] text-[var(--color-accent-amber)] rounded-[var(--radius-pill)] px-[10px] py-[4px] text-[12px] font-medium">
              {lowStockItems.length}
            </span>
          )}
        </div>

        <div className="mt-4 bg-[var(--color-surface-card)] rounded-[var(--radius-lg)] border border-[var(--color-hairline)] overflow-hidden">
          {lowStockItems.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="All products well stocked"
              description="Your inventory levels are looking good"
            />
          ) : (
            /* Horizontally scrollable on mobile */
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table className="w-full" style={{ minWidth: '480px' }}>
                <thead>
                  <tr className="bg-[var(--color-surface-cream-strong)]">
                    {TABLE_COLS.map((col) => (
                      <th
                        key={col}
                        className="px-5 py-[10px] text-left text-[12px] font-medium text-[var(--color-muted)] uppercase tracking-[0.8px]"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((product, i) => (
                    <tr
                      key={product.id}
                      className={`h-[52px] ${
                        i < lowStockItems.length - 1
                          ? 'border-b border-[var(--color-hairline)]'
                          : ''
                      }`}
                    >
                      <td className="px-5 text-[14px] font-medium text-[var(--color-ink)]">
                        {product.name}
                      </td>
                      <td
                        className="px-5 text-[13px] text-[var(--color-muted)]"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {product.sku}
                      </td>
                      <td className={`px-5 text-[14px] ${stockQtyClass(product.quantity)}`}>
                        {product.quantity}
                      </td>
                      <td className="px-5">
                        <Badge variant={stockBadgeVariant(product.quantity)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
