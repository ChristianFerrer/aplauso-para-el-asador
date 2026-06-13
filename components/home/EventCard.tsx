import { getTranslations } from 'next-intl/server'
import { MapPin, Calendar, FileText } from 'lucide-react'
import { Event } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface Props {
  event: Event
  locale: string
}

export default async function EventCard({ event, locale }: Props) {
  const t = await getTranslations('home')

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-5">
        <h1 className="text-2xl font-bold text-white">{event.name}</h1>
        {event.description && (
          <p className="text-brand-100 text-sm mt-1">{event.description}</p>
        )}
      </div>

      {/* Details */}
      <div className="px-6 py-4 space-y-3">
        <div className="flex items-center gap-3 text-sm text-stone-600">
          <Calendar className="w-4 h-4 text-brand-500 flex-shrink-0" strokeWidth={1.5} />
          <span>{formatDate(event.event_date, locale)}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-stone-600">
          <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" strokeWidth={1.5} />
          <span>{event.location || '—'}</span>
        </div>
      </div>
    </div>
  )
}
