import { getTranslations } from 'next-intl/server'
import { Users, CheckCircle, Clock, XCircle, Circle } from 'lucide-react'
import { EventGuest } from '@/lib/types'
import { getInitials } from '@/lib/utils'

interface Props {
  guests: EventGuest[]
}

const statusConfig = {
  arrived: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  on_way: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  not_going: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-50' },
  pending: { icon: Circle, color: 'text-stone-300', bg: 'bg-stone-50' },
}

export default async function GuestList({ guests }: Props) {
  const t = await getTranslations('home')

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-brand-500" strokeWidth={1.5} />
        <h2 className="text-sm font-semibold text-stone-700">
          {t('guests')} · {guests.length}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {guests.map(guest => {
          const cfg = statusConfig[guest.status]
          const Icon = cfg.icon
          const name = guest.profile?.name || '—'

          return (
            <div
              key={guest.id}
              className={`flex items-center gap-3 p-3 rounded-xl ${cfg.bg}`}
            >
              <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">
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
              <span className="text-sm font-medium text-stone-700 truncate flex-1">{name}</span>
              <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.color}`} strokeWidth={1.5} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
