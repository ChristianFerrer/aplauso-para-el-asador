'use client'

import { useState, useTransition } from 'react'
import { updateAttendance } from '@/lib/actions'
import { EventGuest, AttendanceStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  guests: EventGuest[]
  userId: string
  eventId: string
}

type Column = {
  id: AttendanceStatus
  label: string
  activeHeader: string
  dropRing: string
}

const COLUMNS: Column[] = [
  {
    id: 'pending',
    label: 'Pendiente',
    activeHeader: 'bg-stone-500 text-white',
    dropRing: 'ring-2 ring-stone-400 bg-stone-50',
  },
  {
    id: 'on_way',
    label: 'En Camino',
    activeHeader: 'bg-yellow-500 text-white',
    dropRing: 'ring-2 ring-yellow-400 bg-yellow-50',
  },
  {
    id: 'arrived',
    label: 'Llegué',
    activeHeader: 'bg-teal-600 text-white',
    dropRing: 'ring-2 ring-teal-400 bg-teal-50',
  },
  {
    id: 'not_going',
    label: 'No voy',
    activeHeader: 'bg-red-500 text-white',
    dropRing: 'ring-2 ring-red-400 bg-red-50',
  },
]

export default function AttendanceKanban({ guests: initialGuests, userId, eventId }: Props) {
  const [guests, setGuests] = useState(initialGuests)
  const [dragOverCol, setDragOverCol] = useState<AttendanceStatus | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPending, startTransition] = useTransition()

  const myStatus = guests.find(g => g.user_id === userId)?.status ?? 'pending'

  function moveCard(newStatus: AttendanceStatus) {
    if (newStatus === myStatus || isPending) return
    setGuests(prev =>
      prev.map(g => g.user_id === userId ? { ...g, status: newStatus } : g)
    )
    startTransition(async () => { await updateAttendance(eventId, userId, newStatus) })
  }

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
      {/* 4-column grid */}
      <div className="grid grid-cols-4 gap-3">
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
                'flex flex-col gap-2 rounded-xl p-2 min-h-[80px] transition-all duration-150',
                isTarget ? col.dropRing : ''
              )}
            >
              {/* Column header */}
              <button
                onClick={() => moveCard(col.id)}
                disabled={myStatus === col.id || isPending}
                className={cn(
                  'w-full rounded-lg px-2 py-1.5 text-xs font-semibold text-center transition-all',
                  myStatus === col.id
                    ? col.activeHeader
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200 disabled:cursor-default'
                )}
              >
                {col.label}
              </button>

              {/* Cards */}
              {colGuests.map(guest => {
                const isMe = guest.user_id === userId
                const name = guest.profile?.name || '?'

                return (
                  <div
                    key={guest.id}
                    draggable={isMe}
                    onDragStart={isMe ? onDragStart : undefined}
                    onDragEnd={isMe ? onDragEnd : undefined}
                    title={isMe ? 'Arrastrá para cambiar tu estado' : name}
                    className={cn(
                      'rounded-lg px-2.5 py-2 text-xs font-medium select-none transition-all truncate',
                      isMe
                        ? 'bg-teal-700 text-white cursor-grab active:cursor-grabbing shadow-sm active:scale-95'
                        : 'bg-stone-100 text-stone-600 cursor-default'
                    )}
                  >
                    {name}
                  </div>
                )
              })}

              {/* Drop hint */}
              {isTarget && (
                <div className="rounded-lg border-2 border-dashed border-stone-300 h-8 flex items-center justify-center">
                  <span className="text-[10px] text-stone-400 font-medium">Soltar aquí</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {isPending && (
        <p className="text-[10px] text-stone-400 text-center mt-2">Guardando…</p>
      )}
    </div>
  )
}
