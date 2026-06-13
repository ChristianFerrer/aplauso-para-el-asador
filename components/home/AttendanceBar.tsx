'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { updateAttendance } from '@/lib/actions'
import { EventGuest, AttendanceStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  guests: EventGuest[]
  myGuest: EventGuest | null
  eventId: string
  userId: string
  locale: string
}

export default function AttendanceBar({ guests, myGuest, eventId, userId }: Props) {
  const t = useTranslations('home')
  const [status, setStatus] = useState<AttendanceStatus>(myGuest?.status || 'pending')
  const [isPending, startTransition] = useTransition()

  const counts = {
    arrived: guests.filter(g => g.status === 'arrived').length,
    on_way: guests.filter(g => g.status === 'on_way').length,
    not_going: guests.filter(g => g.status === 'not_going').length,
    pending: guests.filter(g => g.status === 'pending').length,
  }

  function handleStatus(newStatus: AttendanceStatus) {
    setStatus(newStatus)
    startTransition(async () => {
      await updateAttendance(eventId, userId, newStatus)
    })
  }

  const options: {
    value: AttendanceStatus
    label: string
    icon: React.ReactNode
    inactive: string
    active: string
  }[] = [
    {
      value: 'arrived',
      label: t('arrived'),
      icon: <CheckCircle className="w-4 h-4" strokeWidth={1.5} />,
      inactive: 'border-green-200 text-green-700 hover:bg-green-50',
      active: 'bg-green-500 border-green-500 text-white',
    },
    {
      value: 'on_way',
      label: t('onWay'),
      icon: <Clock className="w-4 h-4" strokeWidth={1.5} />,
      inactive: 'border-yellow-200 text-yellow-700 hover:bg-yellow-50',
      active: 'bg-yellow-500 border-yellow-500 text-white',
    },
    {
      value: 'not_going',
      label: t('notGoing'),
      icon: <XCircle className="w-4 h-4" strokeWidth={1.5} />,
      inactive: 'border-red-200 text-red-700 hover:bg-red-50',
      active: 'bg-red-500 border-red-500 text-white',
    },
  ]

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4">
      <p className="text-sm font-semibold text-stone-700 mb-3">{t('myStatus')}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleStatus(opt.value)}
            disabled={isPending}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-colors disabled:opacity-60',
              status === opt.value ? opt.active : opt.inactive
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
          <CheckCircle className="w-3 h-3" strokeWidth={1.5} />
          {t('arrivedCount', { count: counts.arrived })}
        </span>
        <span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full">
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          {t('onWayCount', { count: counts.on_way })}
        </span>
        <span className="flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-full">
          <XCircle className="w-3 h-3" strokeWidth={1.5} />
          {t('notGoingCount', { count: counts.not_going })}
        </span>
        {counts.pending > 0 && (
          <span className="flex items-center gap-1 bg-stone-100 text-stone-500 px-2.5 py-1 rounded-full">
            {t('pendingCount', { count: counts.pending })}
          </span>
        )}
      </div>
    </div>
  )
}
