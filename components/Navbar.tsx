'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Flame, List, Settings, LogOut, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import LanguageSwitcher from './LanguageSwitcher'
import { Profile } from '@/lib/types'
import { getInitials } from '@/lib/utils'

interface NavbarProps {
  locale: string
  profile: Profile | null
}

export default function Navbar({ locale, profile }: NavbarProps) {
  const t = useTranslations('nav')
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
    router.refresh()
  }

  const navLink = (href: string) => `/${locale}${href}`

  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`
    return pathname === fullPath || (href !== '/' && pathname.startsWith(fullPath))
  }

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={navLink('/')} className="flex items-center gap-2 font-bold text-stone-900">
          <Flame className="w-6 h-6 text-brand-500" strokeWidth={1.5} />
          <span className="hidden sm:block">Asador</span>
        </Link>

        {/* Nav links */}
        {profile && (
          <div className="flex items-center gap-1">
            <Link
              href={navLink('/')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') && pathname === `/${locale}`
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Flame className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:block">{t('home')}</span>
            </Link>

            <Link
              href={navLink('/lista')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/lista')
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <List className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:block">{t('list')}</span>
            </Link>

            {profile.role === 'admin' && (
              <Link
                href={navLink('/admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/admin')
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Settings className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden sm:block">{t('admin')}</span>
              </Link>
            )}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />

          {profile ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-500 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(profile.name)
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-stone-500 hover:text-stone-900 transition-colors p-2 rounded-lg hover:bg-stone-100"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <Link
              href={navLink('/login')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <LogIn className="w-4 h-4" strokeWidth={1.5} />
              <span>{t('login')}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
