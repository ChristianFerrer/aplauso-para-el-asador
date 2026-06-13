import { getTranslations } from 'next-intl/server'
import { CheckCircle, Clock, XCircle, Circle, Users } from 'lucide-react'
import { EventGuest } from '@/lib/types'
import { getInitials } from '@/lib/utils'

interface Props {
  guests: EventGuest[]
}

const columns = [
  {
    status: 'arrived' as const,
    labelKey: 'arrived' as const,
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: 'bg-green-500',
    cardBg: 'bg-white',
  },
  {
    status: 'on_way' as const,
    labelKey: 'onWay' as const,
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    dot: 'bg-yellow-400',
    cardBg: 'bg-white',
  },
  {
    status: 'not_going' as const,
    labelKey: 'notGoing' as const,
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-400',
    cardBg: 'bg-white',
  },
  {
    status: 'pending' as const,
    labelKey: 'pending' as const,
    icon: Circle,
    color: 'text-stone-400',
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    dot: 'bg-stone-300',
    cardBg: 'bg-white',
  },
]

export default async function GuestList({ guests }: Props) {
  const t = await getTranslations('home')

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-brand-500" strokeWidth={1.5} />
        <h2 className="text-sm font-semibold text-stone-700">
          {t('guests')} · {guests.length}
        </h2>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {columns.map(col => {
          const colGuests = guests.filter(g => g.status === col.status)
          const Icon = col.icon
          return (
            <div
              key={col.status}
              className={`flex flex-col rounded-xl border ${col.border} ${col.bg} p-2.5 min-h-[120px]`}
            >
              {/* Column header */}
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${col.dot}`} />
                <span className={`text-xs font-semibold ${col.color}`}>{t(col.labelKey)}</span>
                <span className={`ml-auto text-xs font-bold ${col.color} bg-white/70 px-1.5 py-0.5 rounded-full`}>
                  {colGuests.length}
                </span>
              </div>

              {/* Guest cards */}
              <div className="space-y-1.5 flex-1">
                {colGuests.length === 0 && (
                  <p className="text-xs text-stone-400 text-center py-3">—</p>
                )}
                {colGuests.map(guest => {
                  const name = guest.profile?.name || '?'
                  return (
                    <div
                      key={guest.id}
                      className="flex items-center gap-2 bg-white rounded-lg px-2 py-1.5 shadow-sm"
                    >
                      <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
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
                      <span className="text-xs font-medium text-stone-700 truncate">{name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
