'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar, Tag, Users } from 'lucide-react'
import { Profile, Event, Category, EventGuest } from '@/lib/types'
import EventAdmin from './EventAdmin'
import CategoriesAdmin from './CategoriesAdmin'
import UsersAdmin from './UsersAdmin'
import { cn } from '@/lib/utils'

interface Props {
  profile: Profile
  event: Event | null
  categories: Category[]
  users: Profile[]
  eventGuests: EventGuest[]
  locale: string
}

type Tab = 'event' | 'categories' | 'users'

export default function AdminPanel({ profile, event, categories, users, eventGuests, locale }: Props) {
  const t = useTranslations('admin')
  const [activeTab, setActiveTab] = useState<Tab>('event')

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'event', label: t('event'), icon: <Calendar className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'categories', label: t('categories'), icon: <Tag className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'users', label: t('users'), icon: <Users className="w-4 h-4" strokeWidth={1.5} /> },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold text-stone-900 mb-6">{t('title')}</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            )}
          >
            {tab.icon}
            <span className="hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'event' && <EventAdmin event={event} />}
        {activeTab === 'categories' && (
          <CategoriesAdmin categories={categories} eventId={event?.id || ''} />
        )}
        {activeTab === 'users' && (
          <UsersAdmin
            users={users}
            currentUserId={profile.id}
            eventGuests={eventGuests}
            eventId={event?.id || ''}
          />
        )}
      </div>
    </div>
  )
}
