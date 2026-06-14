'use client'

import { useState, useTransition, useRef } from 'react'
import { Users, Minus, Plus, Clock, Car, MapPin, XCircle, Check, X, LucideIcon } from 'lucide-react'
import { updateAttendance, updatePlusOnes, addCustomStatus, deleteCustomStatus } from '@/lib/actions'
import { EventGuest, AttendanceStatus, CustomStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  guests: EventGuest[]
  userId: string
  eventId: string
  isAdmin?: boolean
  customStatuses?: CustomStatus[]
}

type BaseColumn = {
  id: string
  label: string
  icon?: LucideIcon
  bg: string
  headerActive: string
  headerIdle: string
  cardOwn: string
  cardOther: string
  drop: string
  isCustom?: boolean
}

const BASE_COLUMNS: BaseColumn[] = [
  {
    id: 'pending', label: 'Pendiente', icon: Clock,
    bg: 'bg-stone-50',
    headerActive: 'bg-stone-700 text-white shadow-sm',
    headerIdle: 'bg-stone-100 text-stone-500 hover:bg-stone-200',
    cardOwn: 'bg-stone-700 text-white shadow-sm ring-2 ring-stone-300',
    cardOther: 'bg-white border border-stone-200 text-stone-600 shadow-card',
    drop: 'ring-2 ring-stone-400 bg-stone-100',
  },
  {
    id: 'on_way', label: 'En Camino', icon: Car,
    bg: 'bg-amber-50',
    headerActive: 'bg-amber-500 text-white shadow-sm shadow-amber-200',
    headerIdle: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    cardOwn: 'bg-amber-500 text-white shadow-sm shadow-amber-200 ring-2 ring-amber-300',
    cardOther: 'bg-white border border-amber-100 text-amber-700 shadow-card',
    drop: 'ring-2 ring-amber-400 bg-amber-100',
  },
  {
    id: 'arrived', label: 'Llegué', icon: MapPin,
    bg: 'bg-emerald-50',
    headerActive: 'bg-emerald-500 text-white shadow-sm shadow-emerald-200',
    headerIdle: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    cardOwn: 'bg-emerald-500 text-white shadow-sm shadow-emerald-200 ring-2 ring-emerald-300',
    cardOther: 'bg-white border border-emerald-100 text-emerald-700 shadow-card',
    drop: 'ring-2 ring-emerald-400 bg-emerald-100',
  },
  {
    id: 'not_going', label: 'No voy', icon: XCircle,
    bg: 'bg-rose-50',
    headerActive: 'bg-rose-500 text-white shadow-sm shadow-rose-200',
    headerIdle: 'bg-rose-100 text-rose-600 hover:bg-rose-200',
    cardOwn: 'bg-rose-500 text-white shadow-sm shadow-rose-200 ring-2 ring-rose-300',
    cardOther: 'bg-white border border-rose-100 text-rose-600 shadow-card',
    drop: 'ring-2 ring-rose-400 bg-rose-100',
  },
]

const COLOR_THEMES: Record<string, Omit<BaseColumn, 'id' | 'label' | 'icon' | 'isCustom'>> = {
  violet: {
    bg: 'bg-violet-50',
    headerActive: 'bg-violet-500 text-white shadow-sm',
    headerIdle: 'bg-violet-100 text-violet-700 hover:bg-violet-200',
    cardOwn: 'bg-violet-500 text-white shadow-sm ring-2 ring-violet-300',
    cardOther: 'bg-white border border-violet-100 text-violet-700 shadow-card',
    drop: 'ring-2 ring-violet-400 bg-violet-100',
  },
  sky: {
    bg: 'bg-sky-50',
    headerActive: 'bg-sky-500 text-white shadow-sm',
    headerIdle: 'bg-sky-100 text-sky-700 hover:bg-sky-200',
    cardOwn: 'bg-sky-500 text-white shadow-sm ring-2 ring-sky-300',
    cardOther: 'bg-white border border-sky-100 text-sky-700 shadow-card',
    drop: 'ring-2 ring-sky-400 bg-sky-100',
  },
  teal: {
    bg: 'bg-teal-50',
    headerActive: 'bg-teal-500 text-white shadow-sm',
    headerIdle: 'bg-teal-100 text-teal-700 hover:bg-teal-200',
    cardOwn: 'bg-teal-500 text-white shadow-sm ring-2 ring-teal-300',
    cardOther: 'bg-white border border-teal-100 text-teal-700 shadow-card',
    drop: 'ring-2 ring-teal-400 bg-teal-100',
  },
  pink: {
    bg: 'bg-pink-50',
    headerActive: 'bg-pink-500 text-white shadow-sm',
    headerIdle: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
    cardOwn: 'bg-pink-500 text-white shadow-sm ring-2 ring-pink-300',
    cardOther: 'bg-white border border-pink-100 text-pink-700 shadow-card',
    drop: 'ring-2 ring-pink-400 bg-pink-100',
  },
  lime: {
    bg: 'bg-lime-50',
    headerActive: 'bg-lime-500 text-white shadow-sm',
    headerIdle: 'bg-lime-100 text-lime-700 hover:bg-lime-200',
    cardOwn: 'bg-lime-500 text-white shadow-sm ring-2 ring-lime-300',
    cardOther: 'bg-white border border-lime-100 text-lime-700 shadow-card',
    drop: 'ring-2 ring-lime-400 bg-lime-100',
  },
  indigo: {
    bg: 'bg-indigo-50',
    headerActive: 'bg-indigo-500 text-white shadow-sm',
    headerIdle: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    cardOwn: 'bg-indigo-500 text-white shadow-sm ring-2 ring-indigo-300',
    cardOther: 'bg-white border border-indigo-100 text-indigo-700 shadow-card',
    drop: 'ring-2 ring-indigo-400 bg-indigo-100',
  },
}

const COLOR_SWATCHES = [
  { key: 'violet', swatch: 'bg-violet-500' },
  { key: 'sky',    swatch: 'bg-sky-500' },
  { key: 'teal',   swatch: 'bg-teal-500' },
  { key: 'pink',   swatch: 'bg-pink-500' },
  { key: 'lime',   swatch: 'bg-lime-500' },
  { key: 'indigo', swatch: 'bg-indigo-500' },
]

export default function AttendanceKanban({ guests: initialGuests, userId, eventId, isAdmin, customStatuses = [] }: Props) {
  const [guests, setGuests] = useState(initialGuests)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isPlusPending, startPlusTransition] = useTransition()
  const [isStatusPending, startStatusTransition] = useTransition()
  const [activeCol, setActiveCol] = useState(0)
  const [showAddStatus, setShowAddStatus] = useState(false)
  const [newStatusName, setNewStatusName] = useState('')
  const [newStatusColor, setNewStatusColor] = useState('violet')
  const [confirmDeleteStatus, setConfirmDeleteStatus] = useState<string | null>(null)
  const draggedUserId = useRef<string>(userId)
  const scrollRef = useRef<HTMLDivElement>(null)

  const myGuest = guests.find(g => g.user_id === userId)
  const myStatus = myGuest?.status ?? 'pending'
  const myPlusOnes = myGuest?.plus_ones ?? 0
  const total = guests.reduce((sum, g) => sum + 1 + (g.plus_ones ?? 0), 0)

  const allColumns: BaseColumn[] = [
    ...BASE_COLUMNS,
    ...customStatuses.map(cs => ({
      id: cs.id,
      label: cs.name,
      isCustom: true,
      ...(COLOR_THEMES[cs.color] ?? COLOR_THEMES.violet),
    })),
  ]

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    const fraction = maxScroll > 0 ? el.scrollLeft / maxScroll : 0
    setActiveCol(Math.round(fraction * (allColumns.length - 1)))
  }

  function moveCard(targetUserId: string, newStatus: string) {
    if (isPending) return
    const current = guests.find(g => g.user_id === targetUserId)
    if (current?.status === newStatus) return
    setGuests(prev => prev.map(g => g.user_id === targetUserId ? { ...g, status: newStatus as AttendanceStatus } : g))
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
  function onDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(colId)
  }
  function onDrop(e: React.DragEvent, colId: string) {
    e.preventDefault()
    setIsDragging(false)
    setDragOverCol(null)
    moveCard(draggedUserId.current, colId)
  }

  function handleAddStatus(e: React.FormEvent) {
    e.preventDefault()
    if (!newStatusName.trim()) return
    startStatusTransition(async () => {
      await addCustomStatus(eventId, newStatusName.trim(), newStatusColor)
      setNewStatusName('')
      setNewStatusColor('violet')
      setShowAddStatus(false)
    })
  }

  function handleDeleteStatus(statusId: string) {
    setConfirmDeleteStatus(null)
    startStatusTransition(async () => { await deleteCustomStatus(statusId) })
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
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowAddStatus(v => !v)}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-100 to-rose-100 border border-orange-200 text-orange-500 hover:from-orange-200 hover:to-rose-200 flex items-center justify-center transition-colors"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          )}
          <span className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-brand">
            {total} {total === 1 ? 'persona' : 'personas'}
          </span>
        </div>
      </div>
      <p className="text-[11px] text-stone-400 mb-3 ml-10">
        Tocá una columna para cambiar tu estado
      </p>

      {/* Add custom status form */}
      {showAddStatus && isAdmin && (
        <form onSubmit={handleAddStatus} className="mb-3 p-3.5 bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl border border-orange-100">
          <p className="text-xs font-bold text-stone-700 mb-2">Nueva columna</p>
          <input
            type="text"
            value={newStatusName}
            onChange={e => setNewStatusName(e.target.value)}
            placeholder="Nombre del estado"
            autoFocus
            className="w-full px-3 py-2 text-sm border-2 border-orange-200 rounded-xl mb-2 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 bg-white"
          />
          <div className="flex gap-1.5 mb-2">
            {COLOR_SWATCHES.map(s => (
              <button
                key={s.key}
                type="button"
                onClick={() => setNewStatusColor(s.key)}
                className={cn(`w-6 h-6 rounded-full ${s.swatch} transition-all`, newStatusColor === s.key ? 'ring-2 ring-offset-1 ring-stone-400 scale-110' : 'opacity-60 hover:opacity-100')}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowAddStatus(false)}
              className="flex-1 py-1.5 text-xs border border-stone-200 rounded-xl text-stone-500 hover:bg-white font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={!newStatusName.trim() || isStatusPending}
              className="flex-1 py-1.5 text-xs bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold disabled:opacity-50">
              {isStatusPending ? '...' : 'Agregar'}
            </button>
          </div>
        </form>
      )}

      {/* Columns carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 sm:overflow-visible sm:pb-0"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {allColumns.map(col => {
          const colGuests = guests.filter(g => g.status === col.id)
          const isTarget = isDragging && dragOverCol === col.id

          return (
            <div
              key={col.id}
              onDragOver={e => onDragOver(e, col.id)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={e => onDrop(e, col.id)}
              className={cn(
                'carousel-col-half flex flex-col gap-1.5 rounded-2xl p-1.5 min-h-[110px] transition-all duration-150',
                col.bg,
                isTarget ? col.drop : ''
              )}
            >
              {/* Column header */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveCard(userId, col.id)}
                  disabled={myStatus === col.id || isPending}
                  className={cn(
                    'flex-1 rounded-xl px-2 py-1.5 transition-all duration-150 disabled:cursor-default',
                    myStatus === col.id ? col.headerActive : col.headerIdle
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold tracking-wide leading-none truncate">{col.label}</span>
                    <span className="text-xs font-bold opacity-70 flex-shrink-0">{colGuests.length}</span>
                  </div>
                </button>
                {isAdmin && col.isCustom && (
                  confirmDeleteStatus === col.id ? (
                    <div className="flex gap-0.5">
                      <button onClick={() => handleDeleteStatus(col.id)} disabled={isStatusPending}
                        className="w-5 h-5 rounded-lg bg-rose-500 text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3" strokeWidth={2.5} />
                      </button>
                      <button onClick={() => setConfirmDeleteStatus(null)}
                        className="w-5 h-5 rounded-lg bg-stone-200 text-stone-600 flex items-center justify-center flex-shrink-0">
                        <X className="w-3 h-3" strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteStatus(col.id)}
                      className="w-5 h-5 rounded-lg bg-white/50 text-stone-400 hover:text-rose-400 flex items-center justify-center flex-shrink-0 transition-colors">
                      <X className="w-3 h-3" strokeWidth={2} />
                    </button>
                  )
                )}
              </div>

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
                    {plusOnes > 0 && <span className="text-[9px] opacity-75 font-medium">+{plusOnes}</span>}
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

      {/* Scroll dots */}
      <div className="flex justify-center gap-1.5 mt-3 sm:hidden">
        {allColumns.map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-full transition-all duration-300',
              i === activeCol
                ? 'w-4 h-1.5 bg-gradient-to-r from-orange-500 to-rose-500'
                : 'w-1.5 h-1.5 bg-stone-200'
            )}
          />
        ))}
      </div>

      {/* Plus ones stepper */}
      <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
        <span className="text-xs text-stone-500 font-medium">¿Venís con alguien?</span>
        <div className="flex items-center gap-2">
          <button onClick={() => changePlusOnes(-1)} disabled={myPlusOnes === 0 || isPlusPending}
            className="w-7 h-7 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 disabled:opacity-30 transition-colors">
            <Minus className="w-3 h-3" strokeWidth={2.5} />
          </button>
          <span className="text-sm font-bold text-stone-800 w-5 text-center tabular-nums">{myPlusOnes}</span>
          <button onClick={() => changePlusOnes(1)} disabled={isPlusPending}
            className="w-7 h-7 rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 hover:from-orange-200 hover:to-rose-200 flex items-center justify-center text-orange-600 disabled:opacity-30 transition-colors">
            <Plus className="w-3 h-3" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
