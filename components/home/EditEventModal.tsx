'use client'

import { useState, useTransition } from 'react'
import { X, Calendar, MapPin, Beef, FileText } from 'lucide-react'
import { updateEvent } from '@/lib/actions'
import { Event } from '@/lib/types'

interface Props {
  event: Event
  onClose: () => void
}

export default function EditEventModal({ event, onClose }: Props) {
  const [name, setName] = useState(event.name)
  const [description, setDescription] = useState(event.description || '')
  const [location, setLocation] = useState(event.location || '')
  const [date, setDate] = useState(event.event_date?.split('T')[0] || '')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setError('')
    startTransition(async () => {
      const res = await updateEvent(event.id, {
        name: name.trim(),
        description: description.trim(),
        location: location.trim(),
        event_date: date,
      })
      if (res?.error) setError(res.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl shadow-black/20 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center">
              <Beef className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            <h2 className="font-display font-bold text-stone-900 text-base">Editar evento</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 transition-colors rounded-xl hover:bg-stone-100"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {error && (
          <div className="text-xs text-rose-600 text-center mb-4 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-2.5 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-stone-600 mb-1.5 block">Nombre del evento</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
              className="w-full px-3.5 py-2.5 text-sm border-2 border-stone-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-stone-600 mb-1.5">
              <MapPin className="w-3 h-3" /> Lugar
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Dirección o lugar"
              className="w-full px-3.5 py-2.5 text-sm border-2 border-stone-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-stone-600 mb-1.5">
              <Calendar className="w-3 h-3" /> Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border-2 border-stone-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-stone-600 mb-1.5">
              <FileText className="w-3 h-3" /> Descripción
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descripción del evento..."
              rows={2}
              className="w-full px-3.5 py-2.5 text-sm border-2 border-stone-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 resize-none"
            />
          </div>

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-stone-200 rounded-2xl text-sm text-stone-600 font-semibold hover:bg-stone-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isPending}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl text-sm font-bold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
