'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Package, Plus, Trash2, X, Check, Sparkles } from 'lucide-react'
import { Category, ListItem, EventGuest } from '@/lib/types'
import CategoryIcon from '@/components/lista/CategoryIcon'
import AddItemModal from '@/components/lista/AddItemModal'
import { deleteListItem, addCategory, deleteCategory } from '@/lib/actions'

const ICONS = [
  'utensils','flame','wine','salad','cake','package',
  'cheese','coffee','apple','fish','beef','shopping-bag',
]

const CATEGORY_COLORS = [
  'from-orange-400 to-rose-500',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-pink-500',
  'from-rose-400 to-red-500',
]

interface Props {
  categories: Category[]
  userId: string
  isAdmin: boolean
  eventId: string
  guests: EventGuest[]
}

export default function ListCarousel({ categories: initialCategories, userId, isAdmin, eventId, guests }: Props) {
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

  const guestOptions = guests
    .filter(g => g.profile?.name)
    .sort((a, b) => (a.user_id === userId ? -1 : b.user_id === userId ? 1 : 0))
    .map(g => ({
      id: g.user_id,
      name: g.user_id === userId ? `${g.profile!.name} (yo)` : g.profile!.name,
    }))

  if (initialCategories.length === 0 && !isAdmin) return null

  const cat = initialCategories[idx] ?? null
  const items = cat?.items || []
  const total = initialCategories.reduce((s, c) => s + (c.items?.length || 0), 0)
  const catColor = CATEGORY_COLORS[idx % CATEGORY_COLORS.length]

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
    <div className="bg-white rounded-3xl shadow-card-md border border-stone-100 p-5">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
          <Package className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <span className="font-display font-bold text-stone-800 text-sm">Lista de items</span>
          <span className="ml-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {total}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIdx(i => Math.max(0, i - 1))}
            disabled={idx === 0 || initialCategories.length === 0}
            className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <span className="text-xs text-stone-400 w-10 text-center font-medium">
            {initialCategories.length > 0 ? `${idx + 1}/${initialCategories.length}` : '0/0'}
          </span>
          <button
            onClick={() => setIdx(i => Math.min(initialCategories.length - 1, i + 1))}
            disabled={idx >= initialCategories.length - 1}
            className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 items-center" style={{ scrollbarWidth: 'none' }}>
        {initialCategories.map((c, i) => {
          const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length]
          return (
            <div key={c.id} className="flex items-center flex-shrink-0">
              <button
                onClick={() => { setIdx(i); setConfirmCatDelete(null) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  i === idx
                    ? `bg-gradient-to-r ${color} text-white shadow-sm`
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                <CategoryIcon name={c.icon} className="w-3 h-3" />
                {c.name}
                <span className={i === idx ? 'opacity-75' : 'opacity-50'}>({c.items?.length || 0})</span>
              </button>

              {isAdmin && i === idx && (
                confirmCatDelete === c.id ? (
                  <div className="flex items-center gap-1 ml-1">
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      disabled={isCatPending}
                      className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center"
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
                    className="ml-1 p-1 text-stone-300 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                  </button>
                )
              )}
            </div>
          )
        })}

        {isAdmin && (
          <button
            onClick={() => setShowAddCat(v => !v)}
            className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-orange-100 to-rose-100 border border-orange-200 text-orange-500 hover:from-orange-200 hover:to-rose-200 flex items-center justify-center transition-colors"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Add category form */}
      {showAddCat && isAdmin && (
        <form onSubmit={handleAddCategory} className="mb-4 p-4 bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl border border-orange-100">
          <p className="text-xs font-bold text-stone-700 mb-2.5">Nueva categoría</p>
          <input
            type="text"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            placeholder="Nombre de la categoría"
            autoFocus
            className="w-full px-3 py-2 text-sm border-2 border-orange-200 rounded-xl mb-2.5 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 bg-white"
          />
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {ICONS.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => setNewCatIcon(icon)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  newCatIcon === icon
                    ? 'bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-sm'
                    : 'bg-white border border-stone-200 text-stone-500 hover:border-orange-300'
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
              className="flex-1 py-2 text-xs border border-stone-200 rounded-xl text-stone-500 hover:bg-white font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!newCatName.trim() || isCatPending}
              className="flex-1 py-2 text-xs bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold disabled:opacity-50 shadow-sm"
            >
              {isCatPending ? '...' : 'Agregar'}
            </button>
          </div>
        </form>
      )}

      {/* Items */}
      <div className="space-y-2 min-h-[60px]">
        {!cat ? (
          <div className="flex flex-col items-center py-8 gap-2">
            <Package className="w-6 h-6 text-stone-300" strokeWidth={1.5} />
            <p className="text-xs text-stone-400 font-medium">
              {isAdmin ? 'Creá la primera categoría con el botón +' : 'Sin categorías aún'}
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2">
            <Sparkles className="w-6 h-6 text-stone-300" strokeWidth={1.5} />
            <p className="text-xs text-stone-400 font-medium">¡Sé el primero en agregar algo!</p>
          </div>
        ) : (
          items.map((item: ListItem) => {
            const isOwn = item.user_id === userId
            const firstName = item.profile?.name?.split(' ')[0] || ''
            return (
              <div
                key={item.id}
                className="group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-stone-50 hover:bg-stone-100/80 border border-stone-100 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-stone-800">{item.item_name}</span>
                  {(item.quantity > 1 || item.unit) && (
                    <span className="text-xs text-stone-400 ml-1.5">
                      ×{item.quantity}{item.unit ? ` ${item.unit}` : ''}
                    </span>
                  )}
                </div>
                {firstName && (
                  <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 bg-gradient-to-r ${catColor} text-white rounded-full shadow-sm`}>
                    {firstName}
                  </span>
                )}
                {isOwn && (
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={deleting === item.id}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-rose-500 transition-all rounded-lg flex-shrink-0 disabled:opacity-30"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Add item */}
      {cat && (
        <button
          onClick={() => setShowItemModal(true)}
          className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-r ${catColor} text-white shadow-sm hover:opacity-90 transition-opacity`}
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Agregar a {cat.name}
        </button>
      )}

      {/* Dot navigation */}
      {initialCategories.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {initialCategories.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`rounded-full transition-all duration-200 ${
                i === idx
                  ? 'w-6 h-1.5 bg-gradient-to-r from-orange-500 to-rose-500'
                  : 'w-1.5 h-1.5 bg-stone-200 hover:bg-stone-300'
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
          isAdmin={isAdmin}
          guestOptions={isAdmin ? guestOptions : undefined}
          defaultUserId={isAdmin ? userId : undefined}
        />
      )}
    </div>
  )
}
