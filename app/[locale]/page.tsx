import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import EventCard from '@/components/home/EventCard'
import AttendanceKanban from '@/components/home/AttendanceKanban'
import ListCarousel from '@/components/home/ListCarousel'
import { Event, EventGuest, Profile, Category, ListItem } from '@/lib/types'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ code?: string; error?: string }>
}

export default async function HomePage({ params, searchParams }: Props) {
  const { locale } = await params
  const { code } = await searchParams

  if (code) {
    redirect(`/api/auth/callback?code=${code}&next=/${locale}`)
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const [profileRes, eventRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('events').select('*').eq('active', true).single(),
  ])

  let profile = profileRes.data as Profile | null

  // Defensive: create profile if trigger missed it
  if (!profile && user) {
    const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario'
    await supabase.from('profiles').upsert({
      id: user.id,
      name,
      avatar_url: user.user_metadata?.avatar_url || null,
      role: 'guest',
    }, { onConflict: 'id' })
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data as Profile | null
  }

  const event = eventRes.data as Event | null

  let guests: EventGuest[] = []
  let categories: Category[] = []

  if (event) {
    // Auto-enroll current user into this event if not already present
    await supabase.from('event_guests').upsert(
      { event_id: event.id, user_id: user.id, status: 'pending', updated_at: new Date().toISOString() },
      { onConflict: 'event_id,user_id', ignoreDuplicates: true }
    )

    const [guestsRes, catsRes] = await Promise.all([
      supabase
        .from('event_guests')
        .select('*, profile:profiles(*)')
        .eq('event_id', event.id)
        .order('updated_at', { ascending: false }),
      supabase
        .from('categories')
        .select('*')
        .eq('event_id', event.id)
        .order('sort_order', { ascending: true }),
    ])

    guests = (guestsRes.data || []) as EventGuest[]

    const cats = (catsRes.data || []) as Category[]
    if (cats.length > 0) {
      const { data: items } = await supabase
        .from('list_items')
        .select('*, profile:profiles(*)')
        .in('category_id', cats.map(c => c.id))
        .order('created_at', { ascending: true })

      categories = cats.map(cat => ({
        ...cat,
        items: ((items || []) as ListItem[]).filter(i => i.category_id === cat.id),
      }))
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar locale={locale} profile={profile} />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {event ? (
          <>
            <EventCard event={event} locale={locale} />
            <AttendanceKanban
              guests={guests}
              eventId={event.id}
              userId={user.id}
            />
            <ListCarousel categories={categories} />
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <p className="text-stone-400 text-sm">No hay evento activo</p>
          </div>
        )}
      </main>
    </div>
  )
}
