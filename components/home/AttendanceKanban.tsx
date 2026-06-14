'use client'

import { useState, useTransition, useRef } from 'react'
import { Users, Minus, Plus, Clock, Car, MapPin, XCircle, LucideIcon } from 'lucide-react'
import { updateAttendance, updatePlusOnes } from '@/lib/actions'
import { EventGuest, AttendanceStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  guests: EventGuest[]
  userId: string
  eventId: string
  isAdmin?: boolean
}

type Column = {
  id: AttendanceStatus
  label: string
  icon: LucideIcon
  bg: string
  headerActive: string
  headerIdle: string
  cardOwn: string
  cardOther: string
  drop: string
}

const COLUMNS: Column[] = [
  {
    id: 'pending',
    label: 'Pendiente',
    icon: Clock,
    bg: 'bg-stone-50',
    headerActive: 'bg-stone-700 text-white shadow-sm',
    headerIdle: 'bg-stone-100 text-stone-500 hover:bg-stone-200',
    cardOwn: 'bg-stone-700 text-white shadow-sm ring-2 ring-stone-300',
    cardOther: 'bg-white border border-stone-200 text-stone-600 shadow-card',
    drop: 'ring-2 ring-stone-400 bg-stone-100',
  },
  {
    id: 'on_way',
    label: 'En Camino',
    icon: Car,
    bg: 'bg-amber-50',
    headerActive: 'bg-amber-500 text-white shadow-sm shadow-amber-200',
    headerIdle: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    cardOwn: 'bg-amber-500 text-white shadow-sm shadow-amber-200 ring-2 ring-amber-300',
    cardOther: 'bg-white border border-amber-100 text-amber-700 shadow-card',
    drop: 'ring-2 ring-amber-400 bg-amber-100',
  },
  {
    id: 'arrived',
    label: 'Llegué',
    icon: MapPin,
    bg: 'bg-emerald-50',
    headerActive: 'bg-emerald-500 text-white shadow-sm shadow-emerald-200',
    headerIdle: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    cardOwn: 'bg-emerald-500 text-white shadow-sm shadow-emerald-200 ring-2 ring-emerald-300',
    cardOther: 'bg-white border border-emerald-100 text-emerald-700 shadow-card',
    drop: 'ring-2 ring-emerald-400 bg-emerald-100',
  },
  {
    id: 'not_going',
    label: 'No voy',
    icon: XCircle,
    bg: 'bg-rose-50',
    headerActive: 'bg-rose-500 text-white shadow-sm shadow-rose-200',
    headerIdle: 'bg-rose-100 text-rose-600 hover:bg-rose-200',
    cardOwn: 'bg-rose-500 text-white shadow-sm shadow-rose-200 ring-2 ring-rose-300',
    cardOther: 'bg-white border border-rose-100 text-rose-600 shadow-card',
    drop: 'ring-2 ring-rose-400 bg-rose-100',
  },
]

export default function AttendanceKanban({ guests: initialGuests, userId, eventId, isAdmin }: Props) {
  const [guests, setGuests] = useState(initialGuests)
  const [dragOverCol, setDragOverCol] = useState<AttendanceStatus | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isPlusPending, startPlusTransition] = useTransition()
  const draggedUserId = useRef<string>(userId)

  const myGuest = guests.find(g => g.user_id === userId)
  const myStatus = myGuest?.status ?? 'pending'
  const myPlusOnes = myGuest?.plus_ones ?? 0
  const total = guests.reduce((sum, g) => sum + 1 + (g.plus_ones ?? 0), 0)

  function moveCard(targetUserId: string, newStatus: AttendanceStatus) {
    if (isPending) return
    const current = guests.find(g => g.user_id === targetUserId)
    if (current?.status === newStatus) return
    setGuests(prev => prev.map(g => g.user_id === targetUserId ? { ...g, status: newStatus } : g))
    startTransition(async () => { await updateAttendance(eventId, targetUserId, newStatus) })
  }

  function changePlusOnes(delta: number) {
    if (isPlusPending) return
    const next = Math.max(0, myPlusOnes + delta)
    setGuests(prev => prev.map(g => g.user_id === userId ? { ...g, plus_ones: next } : g))
    startPlusTransition(async () => { await updatePlusOnes(eventId, userId, next) })
  }

  function onDragStart(e: React.DragEvent, guestUserId: string) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', guestUserId)
    draggedUserId.current = guestUserId
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
    moveCard(draggedUserId.current, colId)
  }

  return (
    <div className="bg-white rounded-3xl shadow-card-md border border-stone-100 p-5">
      {/* Section header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-rose-100 rounded-xl flex items-center justify-center">
            <Users className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
          </div>
          <span className="font-display font-bold text-stone-800 text-sm">Invitados</span>
        </div>
        <span className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-brand">
          {total} {total === 1 ? 'persona' : 'personas'}
        </span>
      </div>
      <p className="text-[11px] text-stone-400 mb-4 ml-10">
        Arrastrá tu tarjeta o tocá la columna para cambiar tu estado
      </p>

      {/* Horizontal carousel — scroll-snap, 2 columns always visible */}
      <div
        className="flex gap-2 overflow-x-auto pb-2"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {COLUMNS.map(col => {
          const colGuests = guests.filter(g => g.status === col.id)
          const isTarget = isDragging && dragOverCol === col.id

          return (
            <div
              key={col.id}
              onDragOver={e => onDragOver(e, col.id)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={e => onDrop(e, col.id)}
              style={{ scrollSnapAlign: 'start', minWidth: 'calc(50% - 4px)', flexShrink: 0 }}
              className={cn(
                'flex flex-col gap-1.5 rounded-2xl p-1.5 min-h-[110px] transition-all duration-150',
                col.bg,
                isTarget ? col.drop : ''
              )}
            >
              {/* Column header — tap to move own card */}
              <button
                onClick={() => moveCard(userId, col.id)}
                disabled={myStatus === col.id || isPending}
                className={cn(
                  'w-full rounded-xl px-2 py-1.5 transition-all duration-150 disabled:cursor-default',
                  myStatus === col.id ? col.headerActive : col.headerIdle
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold tracking-wide leading-none truncate">{col.label}</span>
                  <span className="text-xs font-bold opacity-70 flex-shrink-0">{colGuests.length}</span>
                </div>
              </button>

              {/* Guest cards */}
              {colGuests.map(guest => {
                const isMe = guest.user_id === userId
                const canDrag = isMe || isAdmin
                const name = guest.profile?.name || '?'
                const firstName = name.split(' ')[0]
                const plusOnes = guest.plus_ones ?? 0

                return (
                  <div
                    key={guest.id}
                    draggable={canDrag}
                    onDragStart={canDrag ? e => onDragStart(e, guest.user_id) : undefined}
                    onDragEnd={canDrag ? onDragEnd : undefined}
                    title={isMe ? 'Arrastrá para cambiar tu estado' : isAdmin ? `Mover a ${name}` : undefined}
                    className={cn(
                      'rounded-xl px-2 py-2 text-xs font-semibold select-none transition-all duration-150',
                      isMe
                        ? cn(col.cardOwn, 'cursor-grab active:cursor-grabbing active:scale-95')
                        : isAdmin
                          ? cn(col.cardOther, 'cursor-grab active:cursor-grabbing active:scale-95 hover:brightness-95')
                          : cn(col.cardOther, 'cursor-default')
                    )}
                  >
                    <span className="truncate block leading-tight">{firstName}</span>
                    {plusOnes > 0 && (
                      <span className="text-[9px] opacity-75 font-medium">+{plusOnes}</span>
                    )}
                  </div>
                )
              })}

              {isTarget && (
                <div className="rounded-xl border-2 border-dashed border-current opacity-40 h-8 flex items-center justify-center">
                  <span className="text-[10px] font-semibold">Soltar</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Plus ones stepper */}
      <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
        <span className="text-xs text-stone-500 font-medium">¿Venís con alguien?</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changePlusOnes(-1)}
            disabled={myPlusOnes === 0 || isPlusPending}
            className="w-7 h-7 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 disabled:opacity-30 transition-colors"
          >
            <Minus className="w-3 h-3" strokeWidth={2.5} />
          </button>
          <span className="text-sm font-bold text-stone-800 w-5 text-center tabular-nums">{myPlusOnes}</span>
          <button
            onClick={() => changePlusOnes(1)}
            disabled={isPlusPending}
            className="w-7 h-7 rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 hover:from-orange-200 hover:to-rose-200 flex items-center justify-center text-orange-600 disabled:opacity-30 transition-colors"
          >
            <Plus className="w-3 h-3" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
