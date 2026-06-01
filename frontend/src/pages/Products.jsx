import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Package, Pencil, Search, Trash2 } from 'lucide-react'

import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../api/products.js'
import Badge from '../components/Badge.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import EmptyState from '../components/EmptyState.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import Modal from '../components/Modal.jsx'

// ─── helpers ────────────────────────────────────────────────────────────────

function stockStatus(qty) {
  if (qty === 0) return 'out-of-stock'
  if (qty < 10)  return 'low-stock'
  return 'in-stock'
}

function formatPrice(price) {
  return `₹ ${Number(price).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

// ─── shared input styles ─────────────────────────────────────────────────────

const inputCls =
  'w-full bg-[var(--color-canvas)] border border-[var(--color-hairline)] ' +
  'rounded-[var(--radius-md)] px-[14px] py-[10px] min-h-[44px] text-[14px] ' +
  'text-[var(--color-ink)] outline-none transition-colors ' +
  'placeholder:text-[var(--color-muted-soft)] ' +
  'focus:border-[var(--color-primary)] focus:[box-shadow:var(--ring-focus)]'

const btnPrimaryCls =
  'px-4 text-[14px] font-medium text-[var(--color-on-dark)] bg-[var(--color-primary)] ' +
  'rounded-[var(--radius-md)] hover:bg-[var(--color-primary-active)] transition-colors ' +
  'disabled:opacity-50 min-h-[44px]'

const btnGhostCls =
  'px-4 text-[14px] font-medium text-[var(--color-muted)] ' +
  'rounded-[var(--radius-md)] hover:bg-[var(--color-surface-card)] transition-colors min-h-[44px]'

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[var(--color-muted)] mb-[6px]">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-[4px] text-[12px] text-[var(--color-error)]">{error}</p>
      )}
    </div>
  )
}

// ─── Add / Edit form ──────────────────────────────────────────────────────────

function ProductModal({ product, onClose, onSuccess }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: product
      ? { name: product.name, sku: product.sku, price: product.price, quantity: product.quantity }
      : { name: '', sku: '', price: '', quantity: 0 },
  })

  const { onChange: skuChange, ...skuRest } = register('sku', {
    required: 'SKU is required',
  })

  async function onSubmit(data) {
    const payload = {
      ...data,
      price:    Number(data.price),
      quantity: Number(data.quantity),
    }
    try {
      if (product) {
        await updateProduct(product.id, payload)
      } else {
        await createProduct(payload)
      }
      toast.success('Product saved')
      onSuccess()
      onClose()
    } catch (err) {
      if (err.message.toLowerCase().includes('already exists')) {
        setError('sku', { message: 'SKU already in use — try a different code' })
      } else {
        setError('root', { message: err.message })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field label="Product name" error={errors.name?.message}>
        <input
          className={inputCls}
          placeholder="e.g. Ceramic vase"
          style={{ fontSize: '16px' }}
          {...register('name', {
            required: 'Product name is required',
            minLength: { value: 2, message: 'Product name must be at least 2 characters' },
          })}
        />
      </Field>

      <Field label="SKU" error={errors.sku?.message}>
        <input
          className={inputCls}
          placeholder="e.g. SKU-001"
          style={{ fontSize: '16px' }}
          {...skuRest}
          onChange={(e) => {
            e.target.value = e.target.value.toUpperCase()
            skuChange(e)
          }}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Price" error={errors.price?.message}>
          <div
            className="flex items-center border border-[var(--color-hairline)] rounded-[var(--radius-md)] bg-[var(--color-canvas)] transition-colors min-h-[44px] focus-within:border-[var(--color-primary)] focus-within:[box-shadow:var(--ring-focus)]"
          >
            <span className="pl-[14px] text-[14px] text-[var(--color-muted)] shrink-0 select-none">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="flex-1 min-w-0 bg-transparent outline-none px-2 py-[10px] text-[14px] text-[var(--color-ink)]"
              style={{ fontSize: '16px' }}
              {...register('price', {
                required: 'Enter a valid price',
                min: { value: 0.01, message: 'Enter a valid price' },
              })}
            />
          </div>
        </Field>

        <Field label="Stock quantity" error={errors.quantity?.message}>
          <input
            type="number"
            min="0"
            step="1"
            className={inputCls}
            style={{ fontSize: '16px' }}
            {...register('quantity', {
              required: 'Quantity cannot be negative',
              min: { value: 0, message: 'Quantity cannot be negative' },
              validate: (v) =>
                Number.isInteger(Number(v)) || 'Quantity must be a whole number',
            })}
          />
        </Field>
      </div>

      {errors.root && (
        <p className="text-[13px] text-[var(--color-error)] bg-[rgba(198,69,69,0.08)] px-3 py-2 rounded-[var(--radius-sm)]">
          {errors.root.message}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className={btnGhostCls}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className={btnPrimaryCls}>
          {isSubmitting ? 'Saving…' : 'Save product'}
        </button>
      </div>
    </form>
  )
}

// ─── table columns ────────────────────────────────────────────────────────────

const COLS = [
  { label: 'PRODUCT NAME', align: 'left' },
  { label: 'SKU',          align: 'left' },
  { label: 'PRICE',        align: 'right' },
  { label: 'QUANTITY',     align: 'right' },
  { label: 'STATUS',       align: 'left' },
  { label: 'ACTIONS',      align: 'left' },
]

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Products() {
  const [products,        setProducts]        = useState([])
  const [loading,         setLoading]         = useState(true)
  const [search,          setSearch]          = useState('')
  const [modalMode,       setModalMode]       = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [deleteTarget,    setDeleteTarget]    = useState(null)

  function fetchProducts() {
    getProducts()
      .then(setProducts)
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  const filtered = products.filter((p) => {
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
  })

  function openAdd() { setSelectedProduct(null); setModalMode('add') }
  function openEdit(product) { setSelectedProduct(product); setModalMode('edit') }
  function closeModal() { setModalMode(null); setSelectedProduct(null) }

  async function handleDelete() {
    try {
      await deleteProduct(deleteTarget.id)
      toast.success('Product deleted')
      fetchProducts()
    } catch (err) {
      toast.error(err.message || 'Failed to delete product')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold text-[var(--color-ink)]">Products</h1>
        <button onClick={openAdd} className={btnPrimaryCls}>
          Add product
        </button>
      </div>

      {/* Search */}
      <div className="relative mt-5">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted-soft)]"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or SKU..."
          className={`${inputCls} pl-[40px]`}
          style={{ fontSize: '16px' }}
        />
      </div>

      {/* Table card — horizontally scrollable on mobile */}
      <div className="mt-4 bg-[var(--color-surface-card)] rounded-[var(--radius-lg)] border border-[var(--color-hairline)] overflow-hidden">
        {loading ? (
          <div className="p-4"><LoadingSpinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title={search ? 'No products match your search' : 'No products yet'}
            description={search ? 'Try a different name or SKU' : 'Add your first product to get started'}
            actionLabel={search ? undefined : 'Add product'}
            onAction={search ? undefined : openAdd}
          />
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full" style={{ minWidth: '600px' }}>
              <thead>
                <tr className="bg-[var(--color-surface-cream-strong)]">
                  {COLS.map((col) => (
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
                {filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`h-[52px] ${i < filtered.length - 1 ? 'border-b border-[var(--color-hairline)]' : ''}`}
                  >
                    <td className="px-5 text-[14px] font-medium text-[var(--color-ink)]">
                      {p.name}
                    </td>
                    <td
                      className="px-5 text-[13px] text-[var(--color-muted)]"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {p.sku}
                    </td>
                    <td className="px-5 text-[14px] text-right text-[var(--color-body)]">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-5 text-[14px] text-right text-[var(--color-body)]">
                      {p.quantity}
                    </td>
                    <td className="px-5">
                      <Badge variant={stockStatus(p.quantity)} />
                    </td>
                    <td className="px-5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          aria-label="Edit product"
                          className="w-[44px] h-[44px] md:w-8 md:h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)] transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          aria-label="Delete product"
                          className="w-[44px] h-[44px] md:w-8 md:h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:text-[var(--color-error)] hover:bg-[rgba(198,69,69,0.08)] transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      <Modal
        isOpen={modalMode !== null}
        onClose={closeModal}
        title={modalMode === 'add' ? 'Add product' : 'Edit product'}
        maxWidth="480px"
      >
        <ProductModal
          product={selectedProduct}
          onClose={closeModal}
          onSuccess={fetchProducts}
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete product"
        message={`This will permanently remove ${deleteTarget?.name}. This action cannot be undone.`}
        confirmLabel="Delete product"
        variant="danger"
      />
    </div>
  )
}
