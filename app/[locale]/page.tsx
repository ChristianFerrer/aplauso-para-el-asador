import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import EventCard from '@/components/home/EventCard'
import GuestList from '@/components/home/GuestList'
import AttendanceBar from '@/components/home/AttendanceBar'
import { Event, EventGuest, Profile } from '@/lib/types'

type Props = { params: Promise<{ locale: string }> }

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const [profileRes, eventRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('events').select('*').eq('active', true).single(),
  ])

  const profile = profileRes.data as Profile | null
  const event = eventRes.data as Event | null

  let guests: EventGuest[] = []
  if (event) {
    const { data } = await supabase
      .from('event_guests')
      .select('*, profile:profiles(*)')
      .eq('event_id', event.id)
      .order('updated_at', { ascending: false })
    guests = (data || []) as EventGuest[]
  }

  // Find current user's guest record
  const myGuest = guests.find(g => g.user_id === user.id)

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar locale={locale} profile={profile} />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {event ? (
          <>
            <EventCard event={event} locale={locale} />
            <AttendanceBar
              guests={guests}
              myGuest={myGuest || null}
              eventId={event.id}
              userId={user.id}
              locale={locale}
            />
            <GuestList guests={guests} />
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
