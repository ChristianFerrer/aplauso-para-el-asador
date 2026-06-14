'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Plus, Trash2, X, Check, Sparkles } from 'lucide-react'
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
  const [showItemModal, setShowItemModal] = useState<string | null>(null) // categoryId or null
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmCatDelete, setConfirmCatDelete] = useState<string | null>(null)
  const [showAddCat, setShowAddCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('utensils')
  const [activeCat, setActiveCat] = useState(0)
  const [, startTransition] = useTransition()
  const [isCatPending, startCatTransition] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)

  function handleScroll() {
    const el = scrollRef.current
    if (!el || initialCategories.length <= 1) return
    const maxScroll = el.scrollWidth - el.clientWidth
    const fraction = maxScroll > 0 ? el.scrollLeft / maxScroll : 0
    setActiveCat(Math.round(fraction * (initialCategories.length - 1)))
  }

  const guestOptions = guests
    .filter(g => g.profile?.name)
    .sort((a, b) => (a.user_id === userId ? -1 : b.user_id === userId ? 1 : 0))
    .map(g => ({
      id: g.user_id,
      name: g.user_id === userId ? `${g.profile!.name} (yo)` : g.profile!.name,
    }))

  if (initialCategories.length === 0 && !isAdmin) return null

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
    <div className="bg-white rounded-3xl shadow-card-md border border-stone-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
          <Package className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <span className="font-display font-bold text-stone-800 text-sm">Lista de items</span>
          <span className="ml-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {total}
          </span>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddCat(v => !v)}
            className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-100 to-rose-100 border border-orange-200 text-orange-500 hover:from-orange-200 hover:to-rose-200 flex items-center justify-center transition-colors"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Add category form */}
      {showAddCat && isAdmin && (
        <form onSubmit={handleAddCategory} className="mx-5 mb-4 p-4 bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl border border-orange-100">
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

      {/* Horizontal scrollable columns */}
      {initialCategories.length === 0 ? (
        <div className="flex flex-col items-center py-10 gap-2 px-5 pb-5">
          <Package className="w-6 h-6 text-stone-300" strokeWidth={1.5} />
          <p className="text-xs text-stone-400 font-medium">
            {isAdmin ? 'Creá la primera categoría con el botón +' : 'Sin categorías aún'}
          </p>
        </div>
      ) : (
        <>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto pb-4"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingLeft: '5%', paddingRight: '5%' } as React.CSSProperties}
        >
          {initialCategories.map((cat, i) => {
            const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length]
            const items = cat.items || []

            return (
              <div
                key={cat.id}
                className="carousel-col-main flex flex-col bg-stone-50 rounded-2xl border border-stone-100 overflow-hidden h-80"
              >
                {/* Column header */}
                <div className={`px-3.5 py-3 bg-gradient-to-br ${color} flex items-center gap-2 flex-shrink-0`}>
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <CategoryIcon name={cat.icon} className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="font-display font-bold text-white text-sm flex-1 truncate">{cat.name}</p>
                  <span className="flex-shrink-0 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                  {isAdmin && (
                    confirmCatDelete === cat.id ? (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => handleDeleteCategory(cat.id)} disabled={isCatPending}
                          className="w-5 h-5 rounded-full bg-white/30 text-white flex items-center justify-center hover:bg-white/50 transition-colors">
                          <Check className="w-3 h-3" strokeWidth={2.5} />
                        </button>
                        <button onClick={() => setConfirmCatDelete(null)}
                          className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-colors">
                          <X className="w-3 h-3" strokeWidth={2.5} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmCatDelete(cat.id)}
                        className="flex-shrink-0 p-1 text-white/50 hover:text-white transition-colors">
                        <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                      </button>
                    )
                  )}
                </div>

                {/* Add item button — at the top */}
                <div className="px-2.5 pt-2.5 flex-shrink-0">
                  <button
                    onClick={() => setShowItemModal(cat.id)}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r ${color} text-white shadow-sm hover:opacity-90 transition-opacity`}
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                    Agregar
                  </button>
                </div>

                {/* Items — internal scroll */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d6d3d1 transparent' }}>
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center py-6 gap-2">
                      <Sparkles className="w-4 h-4 text-stone-300" strokeWidth={1.5} />
                      <p className="text-xs text-stone-400 font-medium">¡Sé el primero!</p>
                    </div>
                  ) : (
                    items.map((item: ListItem) => {
                      const isOwn = item.user_id === userId
                      const firstName = item.profile?.name?.split(' ')[0] || ''
                      return (
                        <div key={item.id}
                          className="group flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-stone-100 hover:bg-stone-50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold text-stone-800 block truncate">{item.item_name}</span>
                            {(item.quantity > 1 || item.unit) && (
                              <span className="text-xs text-stone-400">×{item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>
                            )}
                          </div>
                          {firstName && (
                            <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 bg-gradient-to-r ${color} text-white rounded-full`}>
                              {firstName}
                            </span>
                          )}
                          {(isOwn || isAdmin) && (
                            <button onClick={() => handleDeleteItem(item.id)} disabled={deleting === item.id}
                              className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-rose-500 transition-all rounded-lg flex-shrink-0 disabled:opacity-30">
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Instagram-style scroll dots */}
        {initialCategories.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-4">
            {initialCategories.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === activeCat
                    ? 'w-4 h-1.5 bg-gradient-to-r from-orange-500 to-rose-500'
                    : 'w-1.5 h-1.5 bg-stone-200'
                }`}
              />
            ))}
          </div>
        )}
        </>
      )}

      {showItemModal && (
        <AddItemModal
          categoryId={showItemModal}
          onClose={() => setShowItemModal(null)}
          onAdded={() => { setShowItemModal(null); router.refresh() }}
          isAdmin={isAdmin}
          guestOptions={isAdmin ? guestOptions : undefined}
          defaultUserId={isAdmin ? userId : undefined}
        />
      )}
    </div>
  )
}
