'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Trash2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/lib/types'
import CategoryIcon from '@/components/lista/CategoryIcon'
import { useRouter } from 'next/navigation'

const ICON_OPTIONS = [
  'utensils', 'flame', 'wine', 'salad', 'cake', 'package',
  'cheese', 'coffee', 'apple', 'fish', 'beef', 'shopping-bag',
]

interface Props {
  categories: Category[]
  eventId: string
}

export default function CategoriesAdmin({ categories: initial, eventId }: Props) {
  const t = useTranslations('admin')
  const router = useRouter()
  const [categories, setCategories] = useState(initial)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('utensils')
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editIcon, setEditIcon] = useState('')

  async function addCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !eventId) return
    setAdding(true)
    const supabase = createClient()
    const maxOrder = Math.max(0, ...categories.map(c => c.sort_order))
    const { data } = await supabase.from('categories').insert({
      event_id: eventId,
      name: newName.trim(),
      icon: newIcon,
      sort_order: maxOrder + 1,
    }).select().single()
    if (data) setCategories(prev => [...prev, data as Category])
    setNewName('')
    setAdding(false)
    router.refresh()
  }

  async function deleteCategory(id: string) {
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('categories').delete().eq('id', id)
    setCategories(prev => prev.filter(c => c.id !== id))
    setDeleting(null)
    router.refresh()
  }

  async function saveEdit(id: string) {
    const supabase = createClient()
    await supabase.from('categories').update({ name: editName, icon: editIcon }).eq('id', id)
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editName, icon: editIcon } : c))
    setEditId(null)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {/* Existing categories */}
      {categories.map(cat => (
        <div key={cat.id} className="bg-white rounded-2xl border border-stone-200 p-4">
          {editId === cat.id ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setEditIcon(icon)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${
                      editIcon === icon ? 'border-brand-500 bg-brand-50' : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <CategoryIcon name={icon} className="w-4 h-4 text-stone-600" />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditId(null)}
                  className="flex-1 py-2 border border-stone-300 text-stone-600 rounded-xl text-sm hover:bg-stone-50"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={() => saveEdit(cat.id)}
                  className="flex-1 py-2 bg-brand-500 text-white rounded-xl text-sm font-medium hover:bg-brand-600"
                >
                  <Save className="w-4 h-4 inline mr-1" strokeWidth={1.5} />
                  {t('save')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <CategoryIcon name={cat.icon} className="w-5 h-5 text-brand-500" />
              </div>
              <span className="flex-1 font-medium text-stone-800 text-sm">{cat.name}</span>
              <button
                onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditIcon(cat.icon) }}
                className="px-3 py-1.5 text-xs border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50"
              >
                {t('edit')}
              </button>
              <button
                onClick={() => deleteCategory(cat.id)}
                disabled={deleting === cat.id}
                className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Add new */}
      <form onSubmit={addCategory} className="bg-white rounded-2xl border border-dashed border-stone-300 p-4 space-y-3">
        <p className="text-sm font-semibold text-stone-600">{t('addCategory')}</p>
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder={t('categoryName')}
          className="w-full px-3 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <div className="flex flex-wrap gap-2">
          {ICON_OPTIONS.map(icon => (
            <button
              key={icon}
              type="button"
              onClick={() => setNewIcon(icon)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${
                newIcon === icon ? 'border-brand-500 bg-brand-50' : 'border-stone-200 hover:bg-stone-50'
              }`}
            >
              <CategoryIcon name={icon} className="w-4 h-4 text-stone-600" />
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          {t('addCategory')}
        </button>
      </form>
    </div>
  )
}
