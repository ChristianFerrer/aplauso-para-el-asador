import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import CategorySection from '@/components/lista/CategorySection'
import { Category, Profile, ListItem } from '@/lib/types'
import { Package } from 'lucide-react'

type Props = { params: Promise<{ locale: string }> }

export default async function ListaPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('list')
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const [profileRes, eventRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('events').select('*').eq('active', true).single(),
  ])

  const profile = profileRes.data as Profile | null
  const event = eventRes.data

  let categories: Category[] = []
  if (event) {
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .eq('event_id', event.id)
      .order('sort_order', { ascending: true })

    if (cats && cats.length > 0) {
      const { data: items } = await supabase
        .from('list_items')
        .select('*, profile:profiles(*)')
        .in('category_id', cats.map((c: Category) => c.id))
        .order('created_at', { ascending: true })

      categories = cats.map((cat: Category) => ({
        ...cat,
        items: (items || []).filter((i: ListItem) => i.category_id === cat.id),
      }))
    }
  }

  const totalItems = categories.reduce((sum, c) => sum + (c.items?.length || 0), 0)

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar locale={locale} profile={profile} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-stone-900">{t('title')}</h1>
            <p className="text-xs text-stone-500 mt-0.5">{event?.name}</p>
          </div>
          <div className="flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-xl">
            <Package className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm font-bold">{totalItems}</span>
            <span className="text-xs font-normal hidden sm:block">{t('total')}</span>
          </div>
        </div>

        {/* Kanban board — horizontal scroll */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 pb-4">
          <div className="flex gap-3 h-full" style={{ minWidth: `${categories.length * 300}px` }}>
            {categories.map(category => (
              <div key={category.id} className="w-72 flex-shrink-0 flex flex-col">
                <CategorySection
                  category={category}
                  userId={user.id}
                  userRole={profile?.role || 'guest'}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
