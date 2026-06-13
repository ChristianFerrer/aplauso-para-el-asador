'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Package, Plus, Trash2 } from 'lucide-react'
import { Category, ListItem } from '@/lib/types'
import CategoryIcon from '@/components/lista/CategoryIcon'
import AddItemModal from '@/components/lista/AddItemModal'
import { deleteListItem } from '@/lib/actions'

interface Props {
  categories: Category[]
  userId: string
}

export default function ListCarousel({ categories: initialCategories, userId }: Props) {
  const router = useRouter()
  const [idx, setIdx] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  if (initialCategories.length === 0) return null

  const cat = initialCategories[idx]
  const items = cat.items || []
  const total = initialCategories.reduce((s, c) => s + (c.items?.length || 0), 0)

  function handleDelete(itemId: string) {
    setDeleting(itemId)
    startTransition(async () => {
      await deleteListItem(itemId)
      setDeleting(null)
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
            disabled={idx === 0}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <span className="text-xs text-stone-400 w-8 text-center">{idx + 1}/{initialCategories.length}</span>
          <button
            onClick={() => setIdx(i => Math.min(initialCategories.length - 1, i + 1))}
            disabled={idx === initialCategories.length - 1}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
        {initialCategories.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setIdx(i)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              i === idx
                ? 'bg-brand-500 text-white'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            <CategoryIcon name={c.icon} className="w-3 h-3" />
            {c.name}
            <span className={i === idx ? 'opacity-70' : 'opacity-50'}>({c.items?.length || 0})</span>
          </button>
        ))}
      </div>

      {/* Items — stacked cards */}
      <div className="space-y-1.5 min-h-[60px]">
        {items.length === 0 ? (
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
                    onClick={() => handleDelete(item.id)}
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

      {/* Add button */}
      <button
        onClick={() => setShowModal(true)}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium text-brand-600 hover:bg-brand-50 border border-dashed border-brand-200 transition-colors"
      >
        <Plus className="w-4 h-4" strokeWidth={1.5} />
        Agregar a {cat.name}
      </button>

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

      {showModal && (
        <AddItemModal
          categoryId={cat.id}
          onClose={() => setShowModal(false)}
          onAdded={() => {
            setShowModal(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
