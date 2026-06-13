'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { X, AlertCircle } from 'lucide-react'
import { addListItem } from '@/lib/actions'

interface GuestOption { id: string; name: string }

interface Props {
  categoryId: string
  onClose: () => void
  onAdded: () => void
  isAdmin?: boolean
  guestOptions?: GuestOption[]
  defaultUserId?: string
}

const UNITS = ['kg', 'g', 'L', 'ml', 'unidades', 'botellas', 'packs']

export default function AddItemModal({ categoryId, onClose, onAdded, isAdmin, guestOptions, defaultUserId }: Props) {
  const t = useTranslations('list')
  const router = useRouter()
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState('unidades')
  const [notes, setNotes] = useState('')
  const [assignedTo, setAssignedTo] = useState<string>(defaultUserId || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!itemName.trim()) return
    setError('')
    setSaving(true)

    const result = await addListItem({
      categoryId,
      itemName: itemName.trim(),
      quantity: parseFloat(quantity) || 1,
      unit,
      notes: notes.trim(),
      overrideUserId: isAdmin && assignedTo ? assignedTo : undefined,
    })

    setSaving(false)
    if (result?.error) {
      setError(result.error)
    } else {
      router.refresh()
      onAdded()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h3 className="font-semibold text-stone-900">{t('addItem')}</h3>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600 rounded-lg">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              {error}
            </div>
          )}

          <input
            type="text"
            value={itemName}
            onChange={e => setItemName(e.target.value)}
            placeholder={t('itemName')}
            required
            autoFocus
            className="w-full px-4 py-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />

          <div className="flex gap-2">
            <input
              type="number"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder={t('quantity')}
              min="0.1"
              step="0.1"
              className="w-24 px-3 py-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            <select
              value={unit}
              onChange={e => setUnit(e.target.value)}
              className="flex-1 px-3 py-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={t('notes')}
            className="w-full px-4 py-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />

          {isAdmin && guestOptions && guestOptions.length > 0 && (
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1.5 block">Asignar a</label>
              <select
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                className="w-full px-3 py-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {guestOptions.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-stone-300 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving || !itemName.trim()}
              className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? '...' : t('add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
