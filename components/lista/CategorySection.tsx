'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Sparkles } from 'lucide-react'
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

const HEADER_GRADIENTS = [
  'from-orange-500 to-rose-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-blue-500 to-indigo-500',
  'from-purple-500 to-pink-500',
  'from-rose-500 to-red-500',
]

export default function CategorySection({ category, userId, userRole }: Props) {
  const t = useTranslations('list')
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const items = category.items || []
  const gradient = HEADER_GRADIENTS[Math.abs(category.name.charCodeAt(0)) % HEADER_GRADIENTS.length]

  function handleDelete(itemId: string) {
    setDeleting(itemId)
    startTransition(async () => {
      await deleteListItem(itemId)
      setDeleting(null)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col bg-white rounded-3xl shadow-card-md border border-stone-100 h-full min-h-[360px] overflow-hidden">
      {/* Column header */}
      <div className={`px-4 py-3.5 bg-gradient-to-br ${gradient} flex items-center gap-2.5 flex-shrink-0`}>
        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
          <CategoryIcon name={category.icon} className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-white text-sm truncate">{category.name}</p>
        </div>
        <span className="flex-shrink-0 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {items.length === 0 && (
          <div className="flex flex-col items-center py-8 gap-2">
            <Sparkles className="w-5 h-5 text-stone-300" strokeWidth={1.5} />
            <p className="text-xs text-stone-400 font-medium">{t('noItems')}</p>
          </div>
        )}
        {items.map((item: ListItem) => (
          <div
            key={item.id}
            className="group flex items-start gap-2.5 p-3 rounded-2xl bg-stone-50 hover:bg-stone-100/80 transition-colors border border-stone-100/50"
          >
            {/* Avatar */}
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${gradient} text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm overflow-hidden`}>
              {item.profile?.avatar_url ? (
                <img src={item.profile.avatar_url} alt={item.profile.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(item.profile?.name || '?')
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-800 leading-tight">{item.item_name}</p>
              <p className="text-xs text-stone-400 mt-0.5">
                {item.quantity} {item.unit}
                {item.profile?.name && (
                  <> · <span className="text-stone-500 font-medium">{item.profile.name.split(' ')[0]}</span></>
                )}
              </p>
            </div>

            {/* Delete */}
            {(item.user_id === userId || userRole === 'admin') && (
              <button
                onClick={() => handleDelete(item.id)}
                disabled={deleting === item.id}
                className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-rose-500 transition-all rounded-xl flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add button */}
      <div className="flex-shrink-0 px-3 py-3 border-t border-stone-100">
        <button
          onClick={() => setShowModal(true)}
          className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-r ${gradient} text-white shadow-sm hover:opacity-90 transition-opacity`}
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
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
