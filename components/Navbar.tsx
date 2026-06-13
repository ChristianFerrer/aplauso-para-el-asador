'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Flame, List, Settings, LogOut, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
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
    <nav className="glass border-b border-stone-200/60 sticky top-0 z-50 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href={navLink('/')} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-brand group-hover:shadow-brand-lg transition-shadow">
            <Flame className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <span className="hidden sm:block font-display font-bold text-stone-900 tracking-tight text-lg">
            Asador
          </span>
        </Link>

        {/* Nav links */}
        {profile && (
          <div className="flex items-center gap-0.5">
            <Link
              href={navLink('/')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/') && pathname === `/${locale}`
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/80'
              }`}
            >
              <Flame className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:block">{t('home')}</span>
            </Link>

            <Link
              href={navLink('/lista')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/lista')
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/80'
              }`}
            >
              <List className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:block">{t('list')}</span>
            </Link>

            {profile.role === 'admin' && (
              <Link
                href={navLink('/admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/admin')
                    ? 'bg-orange-50 text-orange-600 font-semibold'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/80'
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
          {profile ? (
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-white text-xs font-bold flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  getInitials(profile.name)
                )}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100/80 transition-all"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <Link
              href={navLink('/login')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-brand hover:shadow-brand-lg transition-shadow"
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
