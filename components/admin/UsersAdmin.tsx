'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { ShieldCheck, ShieldOff, Minus, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Profile, EventGuest, AttendanceStatus } from '@/lib/types'
import { getInitials } from '@/lib/utils'
import { updatePlusOnes } from '@/lib/actions'
import { useRouter } from 'next/navigation'

interface Props {
  users: Profile[]
  currentUserId: string
  eventGuests: EventGuest[]
  eventId: string
}

const STATUS_LABELS: Record<AttendanceStatus, { label: string; class: string }> = {
  arrived:   { label: 'Llegó',      class: 'bg-green-100 text-green-700' },
  on_way:    { label: 'En camino',  class: 'bg-yellow-100 text-yellow-700' },
  not_going: { label: 'No va',      class: 'bg-red-100 text-red-700' },
  pending:   { label: 'Pendiente',  class: 'bg-stone-100 text-stone-500' },
}

export default function UsersAdmin({ users: initial, currentUserId, eventGuests: initialGuests, eventId }: Props) {
  const t = useTranslations('admin')
  const router = useRouter()
  const [users, setUsers] = useState(initial)
  const [guests, setGuests] = useState(initialGuests)
  const [updating, setUpdating] = useState<string | null>(null)
  const [isPlusPending, startPlusTransition] = useTransition()

  function getGuest(userId: string) {
    return guests.find(g => g.user_id === userId)
  }

  async function toggleRole(userId: string, currentRole: string) {
    if (userId === currentUserId) return
    setUpdating(userId)
    const newRole = currentRole === 'admin' ? 'guest' : 'admin'
    const supabase = createClient()
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as 'admin' | 'guest' } : u))
    setUpdating(null)
    router.refresh()
  }

  function changePlusOnes(userId: string, delta: number) {
    if (isPlusPending) return
    const guest = getGuest(userId)
    if (!guest) return
    const next = Math.max(0, (guest.plus_ones ?? 0) + delta)
    setGuests(prev => prev.map(g => g.user_id === userId ? { ...g, plus_ones: next } : g))
    startPlusTransition(async () => { await updatePlusOnes(eventId, userId, next) })
  }

  return (
    <div className="space-y-2">
      {users.map(user => {
        const guest = getGuest(user.id)
        const status = guest?.status as AttendanceStatus | undefined
        const statusInfo = status ? STATUS_LABELS[status] : null
        const plusOnes = guest?.plus_ones ?? 0

        return (
          <div key={user.id} className="bg-white rounded-2xl border border-stone-200 p-4">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold flex items-center justify-center flex-shrink-0">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(user.name)
                )}
              </div>

              {/* Name + role */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-900 truncate">
                  {user.name}
                  {user.id === currentUserId && (
                    <span className="ml-1.5 text-xs text-brand-500 font-normal">(tú)</span>
                  )}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                    user.role === 'admin' ? 'bg-brand-50 text-brand-700' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {user.role === 'admin' ? t('admin') : t('guest')}
                  </span>
                  {statusInfo && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Role toggle */}
              {user.id !== currentUserId && (
                <button
                  onClick={() => toggleRole(user.id, user.role)}
                  disabled={updating === user.id}
                  title={user.role === 'admin' ? t('removeAdmin') : t('makeAdmin')}
                  className="p-2 rounded-lg border border-stone-200 text-stone-400 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50 transition-colors disabled:opacity-50"
                >
                  {user.role === 'admin' ? (
                    <ShieldOff className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </button>
              )}
            </div>

            {/* Plus ones row — only if guest is in this event */}
            {guest && (
              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-500">Acompañantes</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changePlusOnes(user.id, -1)}
                    disabled={plusOnes === 0 || isPlusPending}
                    className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-3 h-3" strokeWidth={2} />
                  </button>
                  <span className="text-sm font-semibold text-stone-700 w-5 text-center">{plusOnes}</span>
                  <button
                    onClick={() => changePlusOnes(user.id, 1)}
                    disabled={isPlusPending}
                    className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3 h-3" strokeWidth={2} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
