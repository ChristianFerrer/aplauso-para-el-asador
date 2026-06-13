'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Package, Plus, Trash2, X, Check } from 'lucide-react'
import { Category, ListItem } from '@/lib/types'
import CategoryIcon from '@/components/lista/CategoryIcon'
import AddItemModal from '@/components/lista/AddItemModal'
import { deleteListItem, addCategory, deleteCategory } from '@/lib/actions'

const ICONS = [
  'utensils','flame','wine','salad','cake','package',
  'cheese','coffee','apple','fish','beef','shopping-bag',
]

interface Props {
  categories: Category[]
  userId: string
  isAdmin: boolean
  eventId: string
}

export default function ListCarousel({ categories: initialCategories, userId, isAdmin, eventId }: Props) {
  const router = useRouter()
  const [idx, setIdx] = useState(0)
  const [showItemModal, setShowItemModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmCatDelete, setConfirmCatDelete] = useState<string | null>(null)
  const [showAddCat, setShowAddCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('utensils')
  const [, startTransition] = useTransition()
  const [isCatPending, startCatTransition] = useTransition()

  if (initialCategories.length === 0 && !isAdmin) return null

  const cat = initialCategories[idx] ?? null
  const items = cat?.items || []
  const total = initialCategories.reduce((s, c) => s + (c.items?.length || 0), 0)

  function handleDeleteItem(itemId: string) {
    setDeleting(itemId)
    startTransition(async () => {
      await deleteListItem(itemId)
      setDeleting(null)
      router.refresh()
    })
  }

  function handleDeleteCategory(catId: string) {
    setConfirmCatDelete(null)
    startCatTransition(async () => {
      await deleteCategory(catId)
      setIdx(i => Math.max(0, i - 1))
      router.refresh()
    })
  }

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCatName.trim()) return
    startCatTransition(async () => {
      await addCategory(eventId, newCatName.trim(), newCatIcon)
      setNewCatName('')
      setNewCatIcon('utensils')
      setShowAddCat(false)
      router.refresh()
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Package className="w-4 h-4 text-brand-500" strokeWidth={1.5} />
        <span className="text-sm font-semibold text-stone-700">Lista · {total} items</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setIdx(i => Math.max(0, i - 1))}
            disabled={idx === 0 || initialCategories.length === 0}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <span className="text-xs text-stone-400 w-10 text-center">
            {initialCategories.length > 0 ? `${idx + 1}/${initialCategories.length}` : '0/0'}
          </span>
          <button
            onClick={() => setIdx(i => Math.min(initialCategories.length - 1, i + 1))}
            disabled={idx >= initialCategories.length - 1}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 items-center" style={{ scrollbarWidth: 'none' }}>
        {initialCategories.map((c, i) => (
          <div key={c.id} className="flex items-center flex-shrink-0">
            <button
              onClick={() => { setIdx(i); setConfirmCatDelete(null) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                i === idx
                  ? 'bg-brand-500 text-white'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              <CategoryIcon name={c.icon} className="w-3 h-3" />
              {c.name}
              <span className={i === idx ? 'opacity-70' : 'opacity-50'}>({c.items?.length || 0})</span>
            </button>

            {/* Admin: delete category */}
            {isAdmin && i === idx && (
              confirmCatDelete === c.id ? (
                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    disabled={isCatPending}
                    className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                  >
                    <Check className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setConfirmCatDelete(null)}
                    className="w-5 h-5 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center"
                  >
                    <X className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmCatDelete(c.id)}
                  className="ml-1 p-1 text-stone-300 hover:text-red-400 transition-colors"
                  title="Eliminar categoría"
                >
                  <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                </button>
              )
            )}
          </div>
        ))}

        {/* Admin: add category button */}
        {isAdmin && (
          <button
            onClick={() => setShowAddCat(v => !v)}
            className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-50 border border-brand-200 text-brand-500 hover:bg-brand-100 flex items-center justify-center transition-colors"
            title="Nueva categoría"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Add category form (admin) */}
      {showAddCat && isAdmin && (
        <form onSubmit={handleAddCategory} className="mb-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
          <p className="text-xs font-semibold text-stone-600 mb-2">Nueva categoría</p>
          <input
            type="text"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            placeholder="Nombre de la categoría"
            autoFocus
            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex flex-wrap gap-1.5 mb-2">
            {ICONS.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => setNewCatIcon(icon)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  newCatIcon === icon
                    ? 'bg-brand-500 text-white'
                    : 'bg-white border border-stone-200 text-stone-500 hover:border-brand-300'
                }`}
              >
                <CategoryIcon name={icon} className="w-4 h-4" />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowAddCat(false)}
              className="flex-1 py-1.5 text-xs border border-stone-200 rounded-lg text-stone-500 hover:bg-stone-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!newCatName.trim() || isCatPending}
              className="flex-1 py-1.5 text-xs bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 disabled:opacity-50"
            >
              {isCatPending ? '...' : 'Agregar'}
            </button>
          </div>
        </form>
      )}

      {/* Items — stacked cards */}
      <div className="space-y-1.5 min-h-[60px]">
        {!cat ? (
          <p className="text-xs text-stone-400 text-center py-6">
            {isAdmin ? 'Creá la primera categoría con el botón +' : 'Sin categorías aún'}
          </p>
        ) : items.length === 0 ? (
          <p className="text-xs text-stone-400 text-center py-6">Sin items — ¡agregá el primero!</p>
        ) : (
          items.map((item: ListItem) => {
            const isOwn = item.user_id === userId
            return (
              <div
                key={item.id}
                className="group flex items-center gap-2 px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-100 shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-stone-800">{item.item_name}</span>
                  {(item.quantity > 1 || item.unit) && (
                    <span className="text-xs text-stone-400 ml-1.5">
                      ×{item.quantity}{item.unit ? ` ${item.unit}` : ''}
                    </span>
                  )}
                </div>
                {item.profile?.name && (
                  <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full border border-brand-100">
                    {item.profile.name.split(' ')[0]}
                  </span>
                )}
                {isOwn && (
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={deleting === item.id}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-500 transition-all rounded-lg flex-shrink-0 disabled:opacity-30"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Add item button */}
      {cat && (
        <button
          onClick={() => setShowItemModal(true)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium text-brand-600 hover:bg-brand-50 border border-dashed border-brand-200 transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Agregar a {cat.name}
        </button>
      )}

      {/* Dot navigation */}
      {initialCategories.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {initialCategories.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`rounded-full transition-all duration-200 ${
                i === idx ? 'w-5 h-1.5 bg-brand-500' : 'w-1.5 h-1.5 bg-stone-200 hover:bg-stone-300'
              }`}
            />
          ))}
        </div>
      )}

      {showItemModal && cat && (
        <AddItemModal
          categoryId={cat.id}
          onClose={() => setShowItemModal(false)}
          onAdded={() => { setShowItemModal(false); router.refresh() }}
        />
      )}
    </div>
  )
}
