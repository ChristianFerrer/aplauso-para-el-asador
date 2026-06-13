'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Save, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/types'
import { useRouter } from 'next/navigation'

interface Props {
  event: Event | null
}

export default function EventAdmin({ event }: Props) {
  const t = useTranslations('admin')
  const router = useRouter()
  const [name, setName] = useState(event?.name || '')
  const [location, setLocation] = useState(event?.location || '')
  const [description, setDescription] = useState(event?.description || '')
  const [eventDate, setEventDate] = useState(
    event?.event_date ? event.event_date.slice(0, 16) : ''
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!event) return
    setSaving(true)

    const supabase = createClient()
    await supabase.from('events').update({
      name,
      location,
      description,
      event_date: new Date(eventDate).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', event.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  if (!event) {
    return <p className="text-stone-400 text-sm">No hay evento activo</p>
  }

  const inputClass = "w-full px-4 py-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
          {t('eventName')}
        </label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputClass} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
          {t('eventLocation')}
        </label>
        <input type="text" value={location} onChange={e => setLocation(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
          {t('eventDate')}
        </label>
        <input
          type="datetime-local"
          value={eventDate}
          onChange={e => setEventDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
          {t('eventDescription')}
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
      >
        {saved ? (
          <><CheckCircle className="w-4 h-4" strokeWidth={1.5} />{t('saved')}</>
        ) : (
          <><Save className="w-4 h-4" strokeWidth={1.5} />{t('save')}</>
        )}
      </button>
    </form>
  )
}
