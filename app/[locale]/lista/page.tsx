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
      const categoryIds = cats.map((c: Category) => c.id)
      const { data: items } = await supabase
        .from('list_items')
        .select('*, profile:profiles(*)')
        .in('category_id', categoryIds)
        .order('created_at', { ascending: true })

      categories = cats.map((cat: Category) => ({
        ...cat,
        items: (items || []).filter((i: ListItem) => i.category_id === cat.id),
      }))
    }
  }

  const totalItems = categories.reduce((sum, c) => sum + (c.items?.length || 0), 0)

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar locale={locale} profile={profile} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-stone-900">{t('title')}</h1>
            <p className="text-sm text-stone-500 mt-0.5">
              {t('total')}: <span className="font-semibold text-brand-600">{totalItems}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-2 rounded-xl">
            <Package className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm font-semibold">{totalItems}</span>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map(category => (
            <CategorySection
              key={category.id}
              category={category}
              userId={user.id}
              userRole={profile?.role || 'guest'}
              locale={locale}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
