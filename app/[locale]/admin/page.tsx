import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import AdminPanel from '@/components/admin/AdminPanel'
import { Profile, Event, Category, EventGuest } from '@/lib/types'
import { ShieldAlert } from 'lucide-react'

type Props = { params: Promise<{ locale: string }> }

export default async function AdminPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('admin')
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar locale={locale} profile={profile} />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <ShieldAlert className="w-12 h-12 text-stone-300 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-stone-500">{t('noAdmin')}</p>
        </div>
      </div>
    )
  }

  const [eventRes, categoriesRes, usersRes] = await Promise.all([
    supabase.from('events').select('*').eq('active', true).single(),
    supabase.from('events').select('id').eq('active', true).single().then(async ({ data }) => {
      if (!data) return { data: [] }
      return supabase.from('categories').select('*').eq('event_id', data.id).order('sort_order')
    }),
    supabase.from('profiles').select('*').order('created_at', { ascending: true }),
  ])

  const eventId = (eventRes.data as Event | null)?.id || ''
  let eventGuests: EventGuest[] = []
  let itemCounts: Record<string, number> = {}
  if (eventId) {
    const [guestsRes, itemCountsRes] = await Promise.all([
      supabase.from('event_guests').select('*').eq('event_id', eventId),
      supabase
        .from('list_items')
        .select('user_id')
        .in(
          'category_id',
          (await supabase.from('categories').select('id').eq('event_id', eventId)).data?.map(c => c.id) || []
        ),
    ])
    eventGuests = (guestsRes.data || []) as EventGuest[]
    for (const row of (itemCountsRes.data || [])) {
      if (row.user_id) itemCounts[row.user_id] = (itemCounts[row.user_id] || 0) + 1
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar locale={locale} profile={profile as Profile} />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <AdminPanel
          profile={profile as Profile}
          event={eventRes.data as Event | null}
          categories={(categoriesRes.data || []) as Category[]}
          users={(usersRes.data || []) as Profile[]}
          eventGuests={eventGuests}
          itemCounts={itemCounts}
          locale={locale}
        />
      </main>
    </div>
  )
}
