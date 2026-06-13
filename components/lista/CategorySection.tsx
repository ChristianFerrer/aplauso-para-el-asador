'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Trash2 } from 'lucide-react'
import { deleteListItem } from '@/lib/actions'
import { Category, ListItem } from '@/lib/types'
import { getInitials } from '@/lib/utils'
import AddItemModal from './AddItemModal'
import CategoryIcon from './CategoryIcon'

interface Props {
  category: Category
  userId: string
  userRole: string
}

export default function CategorySection({ category, userId, userRole }: Props) {
  const t = useTranslations('list')
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const items = category.items || []

  function handleDelete(itemId: string) {
    setDeleting(itemId)
    startTransition(async () => {
      await deleteListItem(itemId)
      setDeleting(null)
    })
  }

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-stone-200 h-full min-h-[360px]">
      {/* Column header */}
      <div className="px-4 py-3.5 border-b border-stone-100 flex items-center gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
          <CategoryIcon name={category.icon} className="w-4 h-4 text-brand-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-stone-800 text-sm truncate">{category.name}</p>
        </div>
        <span className="flex-shrink-0 bg-stone-100 text-stone-500 text-xs font-semibold px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      {/* Items — scrollable */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {items.length === 0 && (
          <p className="text-xs text-stone-400 text-center py-6 px-2">{t('noItems')}</p>
        )}
        {items.map((item: ListItem) => (
          <div
            key={item.id}
            className="group flex items-start gap-2 p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors"
          >
            {/* Avatar */}
            <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
              {item.profile?.avatar_url ? (
                <img
                  src={item.profile.avatar_url}
                  alt={item.profile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(item.profile?.name || '?')
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 leading-tight">{item.item_name}</p>
              <p className="text-xs text-stone-400 mt-0.5">
                {item.quantity} {item.unit}
                {item.profile?.name && <> · <span className="text-stone-500">{item.profile.name}</span></>}
              </p>
            </div>

            {/* Delete */}
            {(item.user_id === userId || userRole === 'admin') && (
              <button
                onClick={() => handleDelete(item.id)}
                disabled={deleting === item.id}
                className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-500 transition-all rounded-lg flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add button — pinned at bottom */}
      <div className="flex-shrink-0 px-3 py-2.5 border-t border-stone-100">
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          {t('addItem')}
        </button>
      </div>

      {showModal && (
        <AddItemModal
          categoryId={category.id}
          onClose={() => setShowModal(false)}
          onAdded={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
