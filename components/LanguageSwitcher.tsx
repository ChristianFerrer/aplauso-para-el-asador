'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'

interface Props {
  locale: string
}

export default function LanguageSwitcher({ locale }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  function switchLocale(newLocale: string) {
    const newPath = pathname.replace(/^\/(es|en)/, `/${newLocale}`)
    router.push(newPath)
  }

  return (
    <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
      <Globe className="w-3.5 h-3.5 text-stone-400 ml-1" strokeWidth={1.5} />
      {(['es', 'en'] as const).map(l => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
            locale === l
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
