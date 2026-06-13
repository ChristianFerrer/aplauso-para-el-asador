'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Category, ListItem } from '@/lib/types'
import { getInitials } from '@/lib/utils'
import AddItemModal from './AddItemModal'
import CategoryIcon from './CategoryIcon'
import { useRouter } from 'next/navigation'

interface Props {
  category: Category
  userId: string
  userRole: string
  locale: string
}

export default function CategorySection({ category, userId, userRole, locale }: Props) {
  const t = useTranslations('list')
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const items = category.items || []

  async function deleteItem(itemId: string) {
    setDeleting(itemId)
    const supabase = createClient()
    await supabase.from('list_items').delete().eq('id', itemId)
    setDeleting(null)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* Category header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
            <CategoryIcon name={category.icon} className="w-5 h-5 text-brand-500" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-stone-900 text-sm">{category.name}</p>
            <p className="text-xs text-stone-400">{items.length} items</p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
        )}
      </button>

      {open && (
        <div className="border-t border-stone-100">
          {/* Items list */}
          {items.length > 0 ? (
            <ul className="divide-y divide-stone-50">
              {items.map((item: ListItem) => (
                <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                  {/* User avatar */}
                  <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-500 text-xs font-semibold flex items-center justify-center flex-shrink-0">
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

                  {/* Item info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{item.item_name}</p>
                    <p className="text-xs text-stone-400">
                      {item.quantity} {item.unit} · {item.profile?.name || '—'}
                    </p>
                  </div>

                  {/* Delete (own items or admin) */}
                  {(item.user_id === userId || userRole === 'admin') && (
                    <button
                      onClick={() => deleteItem(item.id)}
                      disabled={deleting === item.id}
                      className="p-1.5 text-stone-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-4 text-xs text-stone-400">{t('noItems')}</p>
          )}

          {/* Add button */}
          <div className="px-5 py-3 border-t border-stone-100">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 text-sm text-brand-600 font-medium hover:text-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              {t('addItem')}
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <AddItemModal
          categoryId={category.id}
          userId={userId}
          onClose={() => setShowModal(false)}
          onAdded={() => { setShowModal(false); router.refresh() }}
        />
      )}
    </div>
  )
}
