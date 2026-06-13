'use client'

import { useState, useTransition, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { ShieldCheck, ShieldOff, Minus, Plus, Pencil, Trash2, Check, X, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Profile, EventGuest, AttendanceStatus } from '@/lib/types'
import { getInitials } from '@/lib/utils'
import {
  updatePlusOnes,
  createPlaceholderGuest,
  updateProfileName,
  removeFromEvent,
  deletePlaceholderUser,
} from '@/lib/actions'
import { useRouter } from 'next/navigation'

interface Props {
  users: Profile[]
  currentUserId: string
  eventGuests: EventGuest[]
  eventId: string
  itemCounts: Record<string, number>
}

const STATUS_LABELS: Record<AttendanceStatus, { label: string; class: string }> = {
  arrived:   { label: 'Llegó',      class: 'bg-green-100 text-green-700' },
  on_way:    { label: 'En camino',  class: 'bg-yellow-100 text-yellow-700' },
  not_going: { label: 'No va',      class: 'bg-red-100 text-red-700' },
  pending:   { label: 'Pendiente',  class: 'bg-stone-100 text-stone-500' },
}

export default function UsersAdmin({ users: initial, currentUserId, eventGuests: initialGuests, eventId, itemCounts }: Props) {
  const t = useTranslations('admin')
  const router = useRouter()

  const [users, setUsers] = useState(initial)
  const [guests, setGuests] = useState(initialGuests)
  const [updating, setUpdating] = useState<string | null>(null)
  const [isPlusPending, startPlusTransition] = useTransition()

  // Create
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [isCreating, startCreateTransition] = useTransition()

  // Inline rename
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [isRenaming, startRenameTransition] = useTransition()

  // Delete
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

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

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    startCreateTransition(async () => {
      const res = await createPlaceholderGuest(eventId, newName)
      if (!res?.error) {
        setNewName('')
        setShowCreate(false)
        router.refresh()
      }
    })
  }

  function startEdit(user: Profile) {
    setEditingId(user.id)
    setEditName(user.name)
    setConfirmDelete(null)
  }

  function handleRename(userId: string) {
    if (!editName.trim()) return
    startRenameTransition(async () => {
      const res = await updateProfileName(userId, editName)
      if (!res?.error) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, name: editName.trim() } : u))
        setEditingId(null)
        router.refresh()
      }
    })
  }

  function handleDelete(user: Profile) {
    setConfirmDelete(null)
    startDeleteTransition(async () => {
      const res = user.is_placeholder
        ? await deletePlaceholderUser(user.id)
        : await removeFromEvent(user.id, eventId)
      if (!res?.error) {
        if (user.is_placeholder) {
          setUsers(prev => prev.filter(u => u.id !== user.id))
          setGuests(prev => prev.filter(g => g.user_id !== user.id))
        } else {
          setGuests(prev => prev.filter(g => g.user_id !== user.id))
        }
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-2">
      {/* Create new guest */}
      <div className="mb-3">
        {showCreate ? (
          <form onSubmit={handleCreate} className="bg-stone-50 rounded-2xl border border-stone-200 p-3 flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nombre del invitado"
              autoFocus
              className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={!newName.trim() || isCreating}
              className="px-3 py-2 text-xs bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 disabled:opacity-50"
            >
              {isCreating ? '...' : 'Agregar'}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreate(false); setNewName('') }}
              className="px-3 py-2 text-xs border border-stone-200 rounded-lg text-stone-500 hover:bg-stone-100"
            >
              Cancelar
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-brand-600 border border-dashed border-brand-200 rounded-xl hover:bg-brand-50 transition-colors w-full justify-center"
          >
            <UserPlus className="w-4 h-4" strokeWidth={1.5} />
            Nuevo invitado
          </button>
        )}
      </div>

      {users.map(user => {
        const guest = getGuest(user.id)
        const status = guest?.status as AttendanceStatus | undefined
        const statusInfo = status ? STATUS_LABELS[status] : null
        const plusOnes = guest?.plus_ones ?? 0
        const isEditing = editingId === user.id
        const isConfirmingDelete = confirmDelete === user.id
        const userItemCount = itemCounts[user.id] || 0

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

              {/* Name + badges */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRename(user.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      autoFocus
                      className="flex-1 min-w-0 px-2 py-1 text-sm border border-brand-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      onClick={() => handleRename(user.id)}
                      disabled={isRenaming || !editName.trim()}
                      className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center disabled:opacity-50"
                    >
                      <Check className="w-3 h-3" strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-stone-900 truncate">
                    {user.name}
                    {user.id === currentUserId && (
                      <span className="ml-1.5 text-xs text-brand-500 font-normal">(tú)</span>
                    )}
                    {user.is_placeholder && (
                      <span className="ml-1.5 text-xs text-stone-400 font-normal">· pendiente</span>
                    )}
                  </p>
                )}
                {!isEditing && (
                  <>
                    {user.email && (
                      <p className="text-[11px] text-stone-400 truncate mt-0.5">{user.email}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
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
                      {userItemCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-stone-100 text-stone-500">
                          {userItemCount} {userItemCount === 1 ? 'item' : 'items'}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              {!isEditing && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Rename */}
                  <button
                    onClick={() => startEdit(user)}
                    title="Editar nombre"
                    className="p-2 rounded-lg text-stone-300 hover:text-brand-500 hover:bg-brand-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>

                  {/* Role toggle — not for self */}
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

                  {/* Delete — not for self */}
                  {user.id !== currentUserId && (
                    isConfirmingDelete ? (
                      <>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={isDeleting}
                          className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center disabled:opacity-50"
                        >
                          <Check className="w-3 h-3" strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" strokeWidth={2.5} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => { setConfirmDelete(user.id); setEditingId(null) }}
                        title={user.is_placeholder ? 'Eliminar invitado' : 'Quitar del evento'}
                        className="p-2 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Plus ones row — only if guest is in this event */}
            {guest && !isEditing && (
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
