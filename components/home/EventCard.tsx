'use client'

import { useState } from 'react'
import { MapPin, Calendar, Clock, Beef, Pencil } from 'lucide-react'
import { Event } from '@/lib/types'
import { formatDateOnly, formatTimeOnly } from '@/lib/utils'
import EditEventModal from './EditEventModal'

interface Props {
  event: Event
  locale: string
  isAdmin?: boolean
}

export default function EventCard({ event, locale, isAdmin }: Props) {
  const [showEdit, setShowEdit] = useState(false)

  return (
    <>
      <div className="bg-white rounded-3xl overflow-hidden shadow-card-md border border-stone-100">
        {/* Hero gradient header */}
        <div className="bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 px-6 py-7 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 left-8 w-24 h-24 bg-black/10 rounded-full" />
          <div className="absolute top-3 right-20 w-10 h-10 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Beef className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <h1 className="font-display text-2xl font-bold text-white tracking-tight leading-tight flex-1">
                {event.name}
              </h1>
              {isAdmin && (
                <button
                  onClick={() => setShowEdit(true)}
                  className="flex-shrink-0 w-8 h-8 bg-white/20 hover:bg-white/35 rounded-xl flex items-center justify-center transition-colors"
                  title="Editar evento"
                >
                  <Pencil className="w-4 h-4 text-white" strokeWidth={1.5} />
                </button>
              )}
            </div>
            {event.description && (
              <p className="text-orange-100/80 text-sm mt-1.5 leading-relaxed ml-12">{event.description}</p>
            )}
          </div>
        </div>

        {/* Details — location, then date, then time, each on its own row */}
        <div className="px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center gap-2.5 text-sm">
            <div className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-rose-500" strokeWidth={1.5} />
            </div>
            <span className="text-stone-700 font-semibold">{event.location || '—'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
            </div>
            <span className="text-stone-700 font-semibold capitalize">{formatDateOnly(event.event_date, locale)}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
            </div>
            <span className="text-stone-700 font-semibold">{formatTimeOnly(event.event_date, locale)} hs</span>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditEventModal event={event} onClose={() => setShowEdit(false)} />
      )}
    </>
  )
}
