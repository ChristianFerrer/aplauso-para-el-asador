'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { GripVertical, Users } from 'lucide-react'
import { updateAttendance } from '@/lib/actions'
import { EventGuest, AttendanceStatus } from '@/lib/types'
import { getInitials, cn } from '@/lib/utils'

interface Props {
  guests: EventGuest[]
  userId: string
  eventId: string
}

type Column = {
  id: AttendanceStatus
  label: string
  headerClass: string
  dropBg: string
  cardClass: string
  myCardClass: string
}

const COLUMNS: Column[] = [
  {
    id: 'pending',
    label: 'Pendiente',
    headerClass: 'bg-stone-500',
    dropBg: 'bg-stone-50 border-stone-400',
    cardClass: 'bg-stone-100 text-stone-700',
    myCardClass: 'bg-stone-600 text-white ring-stone-400',
  },
  {
    id: 'on_way',
    label: 'En Camino',
    headerClass: 'bg-yellow-500',
    dropBg: 'bg-yellow-50 border-yellow-400',
    cardClass: 'bg-yellow-100 text-yellow-800',
    myCardClass: 'bg-yellow-500 text-white ring-yellow-300',
  },
  {
    id: 'arrived',
    label: 'Llegué',
    headerClass: 'bg-green-600',
    dropBg: 'bg-green-50 border-green-400',
    cardClass: 'bg-green-100 text-green-800',
    myCardClass: 'bg-green-600 text-white ring-green-300',
  },
  {
    id: 'not_going',
    label: 'No voy',
    headerClass: 'bg-red-500',
    dropBg: 'bg-red-50 border-red-400',
    cardClass: 'bg-red-100 text-red-800',
    myCardClass: 'bg-red-500 text-white ring-red-300',
  },
]

export default function AttendanceKanban({ guests: initialGuests, userId, eventId }: Props) {
  const t = useTranslations('home')
  const [guests, setGuests] = useState(initialGuests)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOverCol, setDragOverCol] = useState<AttendanceStatus | null>(null)
  const [isPending, startTransition] = useTransition()

  const myGuest = guests.find(g => g.user_id === userId)
  const myStatus = myGuest?.status ?? 'pending'

  function moveCard(newStatus: AttendanceStatus) {
    if (newStatus === myStatus || isPending) return
    setGuests(prev =>
      prev.map(g => g.user_id === userId ? { ...g, status: newStatus } : g)
    )
    startTransition(async () => { await updateAttendance(eventId, userId, newStatus) })
  }

  // ── Desktop drag handlers ──────────────────────────────────────
  function onDragStart(e: React.DragEvent) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', 'mycard')
    setIsDragging(true)
  }

  function onDragEnd() {
    setIsDragging(false)
    setDragOverCol(null)
  }

  function onDragOver(e: React.DragEvent, colId: AttendanceStatus) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(colId)
  }

  function onDrop(e: React.DragEvent, colId: AttendanceStatus) {
    e.preventDefault()
    setIsDragging(false)
    setDragOverCol(null)
    moveCard(colId)
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-brand-500" strokeWidth={1.5} />
        <span className="text-sm font-semibold text-stone-700">
          {t('guests')} · {guests.length}
        </span>
        <span className="ml-auto text-xs text-stone-400">
          {isDragging ? '↕ soltá en una columna' : 'Arrastrá tu tarjeta'}
        </span>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {COLUMNS.map(col => {
          const colGuests = guests.filter(g => g.status === col.id)
          const isTarget = isDragging && dragOverCol === col.id && col.id !== myStatus

          return (
            <div
              key={col.id}
              onDragOver={e => onDragOver(e, col.id)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={e => onDrop(e, col.id)}
              className={cn(
                'flex flex-col rounded-xl border-2 min-h-[130px] transition-all duration-150',
                isTarget
                  ? `border-dashed ${col.dropBg} scale-[1.03] shadow-md`
                  : 'border-transparent'
              )}
            >
              {/* Column header */}
              <div className={`${col.headerClass} rounded-t-lg px-3 py-2`}>
                <p className="text-xs font-bold text-white text-center tracking-wide">
                  {col.label}
                </p>
              </div>

              {/* Cards area */}
              <div className="flex-1 p-2 space-y-1.5 bg-stone-50/50 rounded-b-xl">
                {colGuests.map(guest => {
                  const isMe = guest.user_id === userId
                  const name = guest.profile?.name || '?'

                  return (
                    <div
                      key={guest.id}
                      draggable={isMe}
                      onDragStart={isMe ? onDragStart : undefined}
                      onDragEnd={isMe ? onDragEnd : undefined}
                      className={cn(
                        'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all select-none',
                        isMe
                          ? `${col.myCardClass} cursor-grab active:cursor-grabbing shadow ring-2 ring-offset-1`
                          : `${col.cardClass} cursor-default opacity-80`
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold',
                        isMe ? 'bg-white/30' : 'bg-white/70'
                      )}>
                        {guest.profile?.avatar_url ? (
                          <img
                            src={guest.profile.avatar_url}
                            alt={name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getInitials(name)
                        )}
                      </div>
                      <span className="truncate flex-1">{name}</span>
                      {isMe && (
                        <GripVertical className="w-3 h-3 flex-shrink-0 opacity-60" strokeWidth={2} />
                      )}
                    </div>
                  )
                })}

                {/* Drop zone hint */}
                {isTarget && (
                  <div className="border-2 border-dashed border-current rounded-lg h-8 flex items-center justify-center opacity-60">
                    <span className="text-[10px] font-semibold">Soltar aquí</span>
                  </div>
                )}

                {colGuests.length === 0 && !isTarget && (
                  <p className="text-[10px] text-stone-300 text-center pt-3">—</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile: tap buttons for own card */}
      <div className="mt-3 pt-3 border-t border-stone-100 lg:hidden">
        <p className="text-xs text-stone-400 mb-2 text-center">Tu estado:</p>
        <div className="flex gap-1.5 flex-wrap justify-center">
          {COLUMNS.map(col => (
            <button
              key={col.id}
              onClick={() => moveCard(col.id)}
              disabled={myStatus === col.id || isPending}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                myStatus === col.id
                  ? `${col.myCardClass} ring-2 ring-offset-1 cursor-default`
                  : `${col.cardClass} hover:opacity-90`
              )}
            >
              {col.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
