'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ShieldCheck, ShieldOff, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'
import { getInitials } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Props {
  users: Profile[]
  currentUserId: string
}

export default function UsersAdmin({ users: initial, currentUserId }: Props) {
  const t = useTranslations('admin')
  const router = useRouter()
  const [users, setUsers] = useState(initial)
  const [updating, setUpdating] = useState<string | null>(null)

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

  return (
    <div className="space-y-2">
      {users.map(user => (
        <div key={user.id} className="bg-white rounded-2xl border border-stone-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold flex items-center justify-center flex-shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(user.name)
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-900 truncate">
              {user.name}
              {user.id === currentUserId && (
                <span className="ml-1.5 text-xs text-brand-500 font-normal">(tú)</span>
              )}
            </p>
            <p className="text-xs text-stone-400 capitalize">{user.role}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
              user.role === 'admin'
                ? 'bg-brand-50 text-brand-700'
                : 'bg-stone-100 text-stone-500'
            }`}>
              {user.role === 'admin' ? t('admin') : t('guest')}
            </span>

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
        </div>
      ))}
    </div>
  )
}
