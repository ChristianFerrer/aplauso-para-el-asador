'use client'

import { useState, useTransition } from 'react'
import { Users, Minus, Plus } from 'lucide-react'
import { updateAttendance, updatePlusOnes } from '@/lib/actions'
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
  headerActive: string
  headerIdle: string
  cardClass: string
  myCardClass: string
  dropRing: string
}

const COLUMNS: Column[] = [
  {
    id: 'pending',
    label: 'Pendiente',
    headerActive: 'bg-stone-500 text-white',
    headerIdle: 'bg-stone-100 text-stone-500 hover:bg-stone-200',
    cardClass: 'bg-stone-200 text-stone-700',
    myCardClass: 'bg-stone-600 text-white',
    dropRing: 'ring-2 ring-stone-400 bg-stone-50',
  },
  {
    id: 'on_way',
    label: 'En Camino',
    headerActive: 'bg-yellow-500 text-white',
    headerIdle: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    cardClass: 'bg-yellow-200 text-yellow-900',
    myCardClass: 'bg-yellow-500 text-white',
    dropRing: 'ring-2 ring-yellow-400 bg-yellow-50',
  },
  {
    id: 'arrived',
    label: 'Llegué',
    headerActive: 'bg-green-600 text-white',
    headerIdle: 'bg-green-100 text-green-700 hover:bg-green-200',
    cardClass: 'bg-green-200 text-green-900',
    myCardClass: 'bg-green-600 text-white',
    dropRing: 'ring-2 ring-green-400 bg-green-50',
  },
  {
    id: 'not_going',
    label: 'No voy',
    headerActive: 'bg-red-500 text-white',
    headerIdle: 'bg-red-100 text-red-700 hover:bg-red-200',
    cardClass: 'bg-red-200 text-red-900',
    myCardClass: 'bg-red-500 text-white',
    dropRing: 'ring-2 ring-red-400 bg-red-50',
  },
]

export default function AttendanceKanban({ guests: initialGuests, userId, eventId }: Props) {
  const [guests, setGuests] = useState(initialGuests)
  const [dragOverCol, setDragOverCol] = useState<AttendanceStatus | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isPlusPending, startPlusTransition] = useTransition()

  const myGuest = guests.find(g => g.user_id === userId)
  const myStatus = myGuest?.status ?? 'pending'
  const myPlusOnes = myGuest?.plus_ones ?? 0

  function moveCard(newStatus: AttendanceStatus) {
    if (newStatus === myStatus || isPending) return
    setGuests(prev => prev.map(g => g.user_id === userId ? { ...g, status: newStatus } : g))
    startTransition(async () => { await updateAttendance(eventId, userId, newStatus) })
  }

  function changePlusOnes(delta: number) {
    if (isPlusPending) return
    const next = Math.max(0, myPlusOnes + delta)
    setGuests(prev => prev.map(g => g.user_id === userId ? { ...g, plus_ones: next } : g))
    startPlusTransition(async () => { await updatePlusOnes(eventId, userId, next) })
  }

  function onDragStart(e: React.DragEvent) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', 'mycard')
    setIsDragging(true)
  }
  function onDragEnd() { setIsDragging(false); setDragOverCol(null) }
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

  const total = guests.length

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-1">
        <Users className="w-4 h-4 text-brand-500" strokeWidth={1.5} />
        <span className="text-sm font-semibold text-stone-700">Invitados · {total}</span>
      </div>
      <p className="text-[11px] text-stone-400 mb-3">
        Arrastrá tu tarjeta a la columna que corresponda a tu estado
      </p>

      {/* 4-column grid */}
      <div className="grid grid-cols-4 gap-2">
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
                'flex flex-col gap-1.5 rounded-xl p-2 min-h-[90px] transition-all duration-150',
                isTarget ? col.dropRing : ''
              )}
            >
              {/* Column header — tap to move */}
              <button
                onClick={() => moveCard(col.id)}
                disabled={myStatus === col.id || isPending}
                className={cn(
                  'w-full rounded-lg px-2 py-1.5 text-center transition-all disabled:cursor-default',
                  myStatus === col.id ? col.headerActive : col.headerIdle
                )}
              >
                <span className="text-xs font-semibold block">{col.label}</span>
                <span className="text-[10px] opacity-70">{colGuests.length}</span>
              </button>

              {/* Guest cards */}
              {colGuests.map(guest => {
                const isMe = guest.user_id === userId
                const name = guest.profile?.name || '?'
                const plusOnes = guest.plus_ones ?? 0

                return (
                  <div
                    key={guest.id}
                    draggable={isMe}
                    onDragStart={isMe ? onDragStart : undefined}
                    onDragEnd={isMe ? onDragEnd : undefined}
                    title={isMe ? 'Arrastrá para cambiar tu estado' : undefined}
                    className={cn(
                      'rounded-lg px-2 py-1.5 text-xs font-medium select-none transition-all',
                      isMe
                        ? cn(col.myCardClass, 'cursor-grab active:cursor-grabbing shadow-sm ring-2 ring-white/40 ring-offset-1 active:scale-95')
                        : cn(col.cardClass, 'cursor-default')
                    )}
                  >
                    <span className="truncate block leading-tight">{name}</span>
                    {plusOnes > 0 && (
                      <span className="text-[10px] opacity-75">+{plusOnes} acompañante{plusOnes !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                )
              })}

              {isTarget && (
                <div className="rounded-lg border-2 border-dashed border-stone-300 h-7 flex items-center justify-center">
                  <span className="text-[10px] text-stone-400 font-medium">Soltar aquí</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Plus ones stepper for current user */}
      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
        <span className="text-xs text-stone-500">¿Venís con alguien? Acompañantes:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changePlusOnes(-1)}
            disabled={myPlusOnes === 0 || isPlusPending}
            className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 disabled:opacity-40 transition-colors"
          >
            <Minus className="w-3 h-3" strokeWidth={2} />
          </button>
          <span className="text-sm font-semibold text-stone-700 w-4 text-center">{myPlusOnes}</span>
          <button
            onClick={() => changePlusOnes(1)}
            disabled={isPlusPending}
            className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 disabled:opacity-40 transition-colors"
          >
            <Plus className="w-3 h-3" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
