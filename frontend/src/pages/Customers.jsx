import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Trash2, Users } from 'lucide-react'

import { createCustomer, deleteCustomer, getCustomers } from '../api/customers.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import EmptyState from '../components/EmptyState.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import Modal from '../components/Modal.jsx'

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ─── shared styles ────────────────────────────────────────────────────────────

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

// ─── Add form ─────────────────────────────────────────────────────────────────

function CustomerModal({ onClose, onSuccess }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: '', email: '', phone: '' } })

  const { onChange: phoneChange, ...phoneRest } = register('phone', {
    required: 'Phone number is required',
    minLength: { value: 10, message: 'Phone number must be at least 10 digits' },
    pattern: { value: /^\d+$/, message: 'Phone number must be numeric' },
  })

  async function onSubmit(data) {
    try {
      await createCustomer(data)
      toast.success('Customer added')
      onSuccess()
      onClose()
    } catch (err) {
      if (err.message.toLowerCase().includes('already registered')) {
        setError('email', { message: 'Email already registered — use a different address' })
      } else {
        setError('root', { message: err.message })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field label="Full name" error={errors.name?.message}>
        <input
          className={inputCls}
          placeholder="e.g. Priya Sharma"
          style={{ fontSize: '16px' }}
          {...register('name', {
            required: 'Full name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
          })}
        />
      </Field>

      <Field label="Email address" error={errors.email?.message}>
        <input
          type="email"
          className={inputCls}
          placeholder="e.g. priya@example.com"
          style={{ fontSize: '16px' }}
          {...register('email', {
            required: 'Email address is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email address',
            },
          })}
        />
      </Field>

      <Field label="Phone number" error={errors.phone?.message}>
        <input
          type="tel"
          inputMode="numeric"
          className={inputCls}
          placeholder="e.g. 9876543210"
          style={{ fontSize: '16px' }}
          {...phoneRest}
          onChange={(e) => {
            e.target.value = e.target.value.replace(/\D/g, '')
            phoneChange(e)
          }}
        />
      </Field>

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
          {isSubmitting ? 'Adding…' : 'Add customer'}
        </button>
      </div>
    </form>
  )
}

// ─── table columns ────────────────────────────────────────────────────────────

const COLS = ['NAME', 'EMAIL', 'PHONE', 'ADDED ON', 'ACTIONS']

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Customers() {
  const [customers,    setCustomers]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [modalOpen,    setModalOpen]    = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  function fetchCustomers() {
    getCustomers()
      .then(setCustomers)
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCustomers() }, [])

  async function handleDelete() {
    try {
      await deleteCustomer(deleteTarget.id)
      toast.success('Customer removed')
      fetchCustomers()
    } catch (err) {
      toast.error(err.message || 'Failed to remove customer')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold text-[var(--color-ink)]">Customers</h1>
        <button onClick={() => setModalOpen(true)} className={btnPrimaryCls}>
          Add customer
        </button>
      </div>

      {/* Table card — horizontally scrollable on mobile */}
      <div className="mt-5 bg-[var(--color-surface-card)] rounded-[var(--radius-lg)] border border-[var(--color-hairline)] overflow-hidden">
        {loading ? (
          <div className="p-4"><LoadingSpinner /></div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Add your first customer to get started"
          />
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full" style={{ minWidth: '600px' }}>
              <thead>
                <tr className="bg-[var(--color-surface-cream-strong)]">
                  {COLS.map((col) => (
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
                {customers.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`h-[52px] ${i < customers.length - 1 ? 'border-b border-[var(--color-hairline)]' : ''}`}
                  >
                    <td className="px-5 text-[14px] font-medium text-[var(--color-ink)]">
                      {c.name}
                    </td>
                    <td className="px-5 text-[14px] text-[var(--color-muted)]">
                      {c.email}
                    </td>
                    <td className="px-5 text-[14px] text-[var(--color-body)]">
                      {c.phone}
                    </td>
                    <td className="px-5 text-[14px] text-[var(--color-muted)]">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-5">
                      <button
                        onClick={() => setDeleteTarget(c)}
                        aria-label="Remove customer"
                        className="w-[44px] h-[44px] md:w-8 md:h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:text-[var(--color-error)] hover:bg-[rgba(198,69,69,0.08)] transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add customer"
        maxWidth="480px"
      >
        <CustomerModal
          onClose={() => setModalOpen(false)}
          onSuccess={fetchCustomers}
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove customer"
        message={`This will permanently remove ${deleteTarget?.name} and all their data.`}
        confirmLabel="Remove customer"
        variant="danger"
      />
    </div>
  )
}
