import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  AlertCircle, Check, Eye, Loader2, Search, ShoppingBag, Trash2, X,
} from 'lucide-react'

import { createOrder, deleteOrder, getOrders } from '../api/orders.js'
import { getCustomers } from '../api/customers.js'
import { getProducts } from '../api/products.js'
import Badge from '../components/Badge.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import EmptyState from '../components/EmptyState.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import Modal from '../components/Modal.jsx'

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatPrice(price) {
  return `₹ ${Number(price).toLocaleString('en-IN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  })}`
}

const btnPrimaryCls =
  'px-4 text-[14px] font-medium text-[var(--color-on-dark)] bg-[var(--color-primary)] ' +
  'rounded-[var(--radius-md)] hover:bg-[var(--color-primary-active)] transition-colors ' +
  'disabled:opacity-40 min-h-[44px]'

const btnGhostCls =
  'px-4 text-[14px] font-medium text-[var(--color-muted)] ' +
  'rounded-[var(--radius-md)] hover:bg-[var(--color-surface-card)] transition-colors min-h-[44px]'

// ─── StepIndicator ───────────────────────────────────────────────────────────

const STEP_LABELS = ['Customer', 'Products', 'Review']

function StepIndicator({ current }) {
  return (
    <div className="flex items-start mb-6">
      {STEP_LABELS.map((label, i) => {
        const num      = i + 1
        const complete = num < current
        const active   = num === current

        return (
          <div key={label} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  complete ? 'bg-[var(--color-accent-teal)]'
                  : active  ? 'bg-[var(--color-primary)]'
                  : 'bg-[var(--color-surface-cream-strong)]'
                }`}
              >
                {complete ? (
                  <Check size={14} className="text-[var(--color-on-dark)]" />
                ) : (
                  <span className={`text-[12px] ${active ? 'font-semibold text-[var(--color-on-dark)]' : 'text-[var(--color-muted)]'}`}>
                    {num}
                  </span>
                )}
              </div>
              {/* Labels hidden on mobile to save space */}
              <span className="hidden md:block text-[12px] text-[var(--color-muted)]">{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className="flex-1 h-px bg-[var(--color-hairline)] mt-[14px] mx-2" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1 — select customer ─────────────────────────────────────────────────

function Step1({ customers, selectedCustomer, onSelect, onClose, onNext }) {
  const [search, setSearch] = useState('')

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted-soft)]"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          style={{ fontSize: '16px' }}
          className="w-full bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-[var(--radius-md)] pl-[40px] pr-[14px] py-[10px] min-h-[44px] text-[14px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-muted-soft)] focus:border-[var(--color-primary)] focus:[box-shadow:var(--ring-focus)]"
        />
      </div>

      <div className="max-h-[240px] md:max-h-[280px] overflow-y-auto flex flex-col gap-[2px]">
        {filtered.length === 0 && (
          <p className="text-[14px] text-[var(--color-muted)] text-center py-8">
            No customers found
          </p>
        )}
        {filtered.map((c) => {
          const isSelected = selectedCustomer?.id === c.id
          return (
            <div
              key={c.id}
              onClick={() => onSelect(c)}
              style={isSelected ? { borderLeft: '2px solid var(--color-primary)' } : {}}
              className={`px-4 py-3 min-h-[44px] rounded-[var(--radius-md)] cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-[var(--color-surface-cream-strong)]'
                  : 'hover:bg-[var(--color-surface-card)]'
              }`}
            >
              <p className="text-[14px] font-medium text-[var(--color-ink)]">{c.name}</p>
              <p className="text-[13px] text-[var(--color-muted)]">{c.email}</p>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className={btnGhostCls}>Cancel</button>
        <button onClick={onNext} disabled={!selectedCustomer} className={btnPrimaryCls}>
          Next
        </button>
      </div>
    </div>
  )
}

// ─── Step 2 — add products ────────────────────────────────────────────────────

function Step2({ products, orderItems, setOrderItems, onBack, onNext }) {
  const [draftProductId, setDraftProductId] = useState('')
  const [draftQty,       setDraftQty]       = useState(1)

  const addedIds     = new Set(orderItems.map((i) => i.product.id))
  const draftProduct = products.find((p) => p.id === draftProductId)
  const isOverStock  = draftProduct != null && Number(draftQty) > draftProduct.quantity
  const canAdd       = draftProduct != null && Number(draftQty) >= 1 && !isOverStock

  function addItem() {
    if (!canAdd) return
    setOrderItems([...orderItems, { product: draftProduct, quantity: Number(draftQty) }])
    setDraftProductId('')
    setDraftQty(1)
  }

  function removeItem(productId) {
    setOrderItems(orderItems.filter((i) => i.product.id !== productId))
  }

  const runningTotal = orderItems.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity, 0
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Add item row — stacks vertically on mobile */}
      <div className="flex flex-col md:flex-row items-stretch md:items-start gap-2">
        <select
          value={draftProductId}
          onChange={(e) => { setDraftProductId(e.target.value); setDraftQty(1) }}
          style={{ fontSize: '16px' }}
          className="w-full md:flex-1 bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-[var(--radius-md)] px-3 py-[10px] min-h-[44px] text-[14px] text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)] focus:[box-shadow:var(--ring-focus)] transition-colors"
        >
          <option value="">Select a product…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id} disabled={addedIds.has(p.id)}>
              {p.name} ({p.quantity} in stock)
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          max={draftProduct?.quantity}
          value={draftQty}
          onChange={(e) => setDraftQty(Math.max(1, Number(e.target.value)))}
          style={{ fontSize: '16px' }}
          className="w-full md:w-[88px] bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-[var(--radius-md)] px-3 py-[10px] min-h-[44px] text-[14px] text-[var(--color-ink)] text-center outline-none focus:border-[var(--color-primary)] focus:[box-shadow:var(--ring-focus)] transition-colors"
        />

        <button
          onClick={addItem}
          disabled={!canAdd}
          className="w-full md:w-auto px-4 py-[10px] min-h-[44px] text-[14px] font-medium text-[var(--color-muted)] border border-[var(--color-hairline)] rounded-[var(--radius-md)] hover:bg-[var(--color-surface-card)] hover:text-[var(--color-ink)] transition-colors disabled:opacity-40"
        >
          Add item
        </button>
      </div>

      {isOverStock && draftProduct && (
        <p className="text-[13px] text-[var(--color-accent-amber)] -mt-2">
          Only {draftProduct.quantity} units available
        </p>
      )}

      {/* Added items */}
      {orderItems.length > 0 && (
        <div className="mt-2">
          {orderItems.map((item, i) => (
            <div
              key={item.product.id}
              className={`flex items-center py-3 ${
                i < orderItems.length - 1 ? 'border-b border-[var(--color-hairline)]' : ''
              }`}
            >
              <span className="flex-1 text-[14px] font-medium text-[var(--color-ink)] truncate mr-2">
                {item.product.name}
              </span>
              <span className="text-[13px] text-[var(--color-muted)] mx-2 shrink-0">
                {item.quantity} × {formatPrice(item.product.price)}
              </span>
              <span className="text-[14px] font-medium text-[var(--color-ink)] w-20 text-right shrink-0">
                {formatPrice(Number(item.product.price) * item.quantity)}
              </span>
              <button
                onClick={() => removeItem(item.product.id)}
                className="ml-2 w-[44px] h-[44px] md:w-7 md:h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:text-[var(--color-error)] hover:bg-[rgba(198,69,69,0.08)] transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          ))}

          {/* Running total — smaller on mobile */}
          <div className="flex flex-col items-end mt-5">
            <span className="text-[13px] text-[var(--color-muted)]">Order total</span>
            <span
              className="text-[24px] md:text-[32px] font-normal text-[var(--color-ink)] leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {formatPrice(runningTotal)}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={onBack} className={btnGhostCls}>Back</button>
        <button onClick={onNext} disabled={orderItems.length === 0} className={btnPrimaryCls}>
          Review order
        </button>
      </div>
    </div>
  )
}

// ─── Step 3 — review & confirm ────────────────────────────────────────────────

function Step3({ selectedCustomer, orderItems, onBack, onSuccess }) {
  const [submitting, setSubmitting] = useState(false)
  const [apiError,   setApiError]   = useState(null)

  const orderTotal = orderItems.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity, 0
  )

  async function placeOrder() {
    setSubmitting(true)
    setApiError(null)
    try {
      await createOrder({
        customer_id: selectedCustomer.id,
        items: orderItems.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      })
      toast.success('Order placed')
      onSuccess()
    } catch (err) {
      setApiError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-lg)] p-4 md:p-6 border border-[var(--color-hairline)]">
        <p className="text-[12px] font-medium text-[var(--color-muted)] uppercase tracking-[0.8px] mb-1">Customer</p>
        <p className="text-[16px] font-medium text-[var(--color-ink)]">{selectedCustomer.name}</p>

        <div className="h-px bg-[var(--color-hairline)] my-4" />

        <p className="text-[12px] font-medium text-[var(--color-muted)] uppercase tracking-[0.8px] mb-3">Order items</p>
        {orderItems.map((item, i) => (
          <div key={i} className="flex items-center py-[6px]">
            <span className="flex-1 text-[14px] text-[var(--color-ink)] truncate mr-2">{item.product.name}</span>
            <span className="text-[13px] text-[var(--color-muted)] w-10 text-center shrink-0">×{item.quantity}</span>
            <span className="text-[14px] font-medium text-[var(--color-ink)] w-24 text-right shrink-0">
              {formatPrice(Number(item.product.price) * item.quantity)}
            </span>
          </div>
        ))}

        <div className="h-px bg-[var(--color-hairline)] my-4" />

        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold text-[var(--color-ink)]">Total</span>
          <span className="text-[18px] font-semibold text-[var(--color-ink)]">{formatPrice(orderTotal)}</span>
        </div>
      </div>

      {apiError && (
        <div className="flex items-start gap-3 bg-[rgba(198,69,69,0.06)] border border-[rgba(198,69,69,0.2)] rounded-[var(--radius-md)] px-4 py-3">
          <AlertCircle size={16} className="text-[var(--color-error)] shrink-0 mt-[1px]" />
          <p className="text-[14px] text-[var(--color-error)]">{apiError}</p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button type="button" onClick={onBack} disabled={submitting} className={btnGhostCls}>
          Back
        </button>
        <button
          onClick={placeOrder}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 py-[10px] min-h-[44px] text-[14px] font-medium text-[var(--color-on-dark)] bg-[var(--color-primary)] rounded-[var(--radius-md)] hover:bg-[var(--color-primary-active)] transition-colors disabled:opacity-50"
        >
          {submitting ? <><Loader2 size={16} className="animate-spin" /> Placing order…</> : 'Place order'}
        </button>
      </div>
    </div>
  )
}

// ─── Create order modal content ───────────────────────────────────────────────

function CreateOrderContent({ customers, products, onClose, onSuccess }) {
  const [step,             setStep]             = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [orderItems,       setOrderItems]       = useState([])

  return (
    <>
      <StepIndicator current={step} />
      {step === 1 && (
        <Step1
          customers={customers}
          selectedCustomer={selectedCustomer}
          onSelect={setSelectedCustomer}
          onClose={onClose}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <Step2
          products={products}
          orderItems={orderItems}
          setOrderItems={setOrderItems}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <Step3
          selectedCustomer={selectedCustomer}
          orderItems={orderItems}
          onBack={() => setStep(2)}
          onSuccess={onSuccess}
        />
      )}
    </>
  )
}

// ─── View order modal ─────────────────────────────────────────────────────────

const VIEW_COLS = ['PRODUCT', 'QTY', 'UNIT PRICE', 'SUBTOTAL']

function ViewOrderModal({ order, customers, onClose }) {
  const customer = customers.find((c) => c.id === order.customer_id)

  return (
    <Modal isOpen onClose={onClose} title="Order details" maxWidth="560px">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="text-[13px] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
          #{order.id.slice(0, 8)}
        </span>
        <span className="text-[var(--color-hairline)]">·</span>
        <span className="text-[13px] text-[var(--color-muted)]">{formatDate(order.created_at)}</span>
        <Badge variant={order.status === 'confirmed' ? 'confirmed' : 'cancelled'} />
      </div>

      <div className="mb-5">
        <p className="text-[12px] font-medium text-[var(--color-muted)] uppercase tracking-[0.8px] mb-1">Customer</p>
        <p className="text-[14px] font-medium text-[var(--color-ink)]">{customer?.name ?? '—'}</p>
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] overflow-hidden mb-6">
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full" style={{ minWidth: '400px' }}>
            <thead>
              <tr className="bg-[var(--color-surface-cream-strong)]">
                {VIEW_COLS.map((col) => (
                  <th
                    key={col}
                    className={`px-4 py-[10px] text-[12px] font-medium text-[var(--color-muted)] uppercase tracking-[0.8px] ${
                      col === 'SUBTOTAL' || col === 'UNIT PRICE' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr
                  key={i}
                  className={`h-[48px] ${i < order.items.length - 1 ? 'border-b border-[var(--color-hairline)]' : ''}`}
                >
                  <td className="px-4 text-[14px] text-[var(--color-ink)]">{item.product_name}</td>
                  <td className="px-4 text-[14px] text-[var(--color-muted)]">{item.quantity}</td>
                  <td className="px-4 text-[14px] text-[var(--color-muted)] text-right">{formatPrice(item.unit_price)}</td>
                  <td className="px-4 text-[14px] font-medium text-[var(--color-ink)] text-right">
                    {formatPrice(Number(item.unit_price) * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[var(--color-hairline)]">
                <td colSpan={3} className="px-4 py-3 text-[14px] font-semibold text-[var(--color-ink)]">Total</td>
                <td className="px-4 py-3 text-[14px] font-semibold text-[var(--color-ink)] text-right">
                  {formatPrice(order.total_amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onClose} className="px-4 min-h-[44px] text-[14px] font-medium text-[var(--color-muted)] rounded-[var(--radius-md)] hover:bg-[var(--color-surface-card)] transition-colors">
          Close
        </button>
      </div>
    </Modal>
  )
}

// ─── table columns ────────────────────────────────────────────────────────────

const TABLE_COLS = [
  { label: 'ORDER ID', align: 'left' },
  { label: 'CUSTOMER', align: 'left' },
  { label: 'ITEMS',    align: 'left' },
  { label: 'TOTAL',    align: 'right' },
  { label: 'STATUS',   align: 'left' },
  { label: 'DATE',     align: 'left' },
  { label: 'ACTIONS',  align: 'left' },
]

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Orders() {
  const [orders,       setOrders]       = useState([])
  const [customers,    setCustomers]    = useState([])
  const [products,     setProducts]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [createModal,  setCreateModal]  = useState(false)
  const [viewOrder,    setViewOrder]    = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  function fetchOrders() {
    getOrders()
      .then(setOrders)
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    Promise.all([getOrders(), getCustomers(), getProducts()])
      .then(([o, c, p]) => { setOrders(o); setCustomers(c); setProducts(p) })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  function handleOrderCreated() {
    setCreateModal(false)
    fetchOrders()
  }

  async function handleDelete() {
    try {
      await deleteOrder(deleteTarget.id)
      toast.success('Order cancelled')
      fetchOrders()
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold text-[var(--color-ink)]">Orders</h1>
        <button onClick={() => setCreateModal(true)} className={btnPrimaryCls}>
          Create order
        </button>
      </div>

      {/* Table card — horizontally scrollable on mobile */}
      <div className="mt-5 bg-[var(--color-surface-card)] rounded-[var(--radius-lg)] border border-[var(--color-hairline)] overflow-hidden">
        {loading ? (
          <div className="p-4"><LoadingSpinner /></div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            description="Create your first order to start tracking sales"
          />
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full" style={{ minWidth: '700px' }}>
              <thead>
                <tr className="bg-[var(--color-surface-cream-strong)]">
                  {TABLE_COLS.map((col) => (
                    <th
                      key={col.label}
                      className={`px-5 py-[10px] text-[12px] font-medium text-[var(--color-muted)] uppercase tracking-[0.8px] ${
                        col.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => {
                  const customerName = customers.find((c) => c.id === order.customer_id)?.name ?? '—'
                  return (
                    <tr
                      key={order.id}
                      className={`h-[52px] ${i < orders.length - 1 ? 'border-b border-[var(--color-hairline)]' : ''}`}
                    >
                      <td className="px-5 text-[13px] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-5 text-[14px] font-medium text-[var(--color-ink)]">{customerName}</td>
                      <td className="px-5 text-[14px] text-[var(--color-muted)]">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-5 text-[14px] font-medium text-[var(--color-ink)] text-right">
                        {formatPrice(order.total_amount)}
                      </td>
                      <td className="px-5">
                        <Badge variant={order.status === 'confirmed' ? 'confirmed' : 'cancelled'} />
                      </td>
                      <td className="px-5 text-[14px] text-[var(--color-muted)]">{formatDate(order.created_at)}</td>
                      <td className="px-5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewOrder(order)}
                            aria-label="View order"
                            className="w-[44px] h-[44px] md:w-8 md:h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)] transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(order)}
                            aria-label="Cancel order"
                            className="w-[44px] h-[44px] md:w-8 md:h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:text-[var(--color-error)] hover:bg-[rgba(198,69,69,0.08)] transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create order modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create order" maxWidth="600px">
        <CreateOrderContent
          customers={customers}
          products={products}
          onClose={() => setCreateModal(false)}
          onSuccess={handleOrderCreated}
        />
      </Modal>

      {/* View order modal */}
      {viewOrder && (
        <ViewOrderModal order={viewOrder} customers={customers} onClose={() => setViewOrder(null)} />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Cancel order"
        message="Cancelling this order will restore stock for all items."
        confirmLabel="Cancel order"
        variant="danger"
      />
    </div>
  )
}
