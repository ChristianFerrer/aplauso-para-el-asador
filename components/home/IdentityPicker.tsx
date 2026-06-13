'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { claimIdentity, skipIdentityClaim } from '@/lib/actions'
import { Flame } from 'lucide-react'

interface Placeholder { id: string; name: string }
interface Props { initialPlaceholders: Placeholder[] }

const BUBBLE_COLORS = [
  'from-orange-500 to-rose-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-red-500 to-rose-600',
  'from-orange-600 to-red-500',
  'from-yellow-500 to-orange-500',
]

export default function IdentityPicker({ initialPlaceholders }: Props) {
  const router = useRouter()
  const [placeholders, setPlaceholders] = useState(initialPlaceholders)
  const [selected, setSelected] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('identity-claims')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        const updated = payload.new as { id: string; is_placeholder: boolean; identity_claimed: boolean }
        if (updated.identity_claimed || !updated.is_placeholder) {
          setPlaceholders(prev => prev.filter(p => p.id !== updated.id))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  function handleClaim(id: string) {
    setSelected(id)
    setError('')
    startTransition(async () => {
      const res = await claimIdentity(id)
      if (res?.error) { setError(res.error); setSelected(null) }
      else router.refresh()
    })
  }

  function handleSkip() {
    startTransition(async () => { await skipIdentityClaim(); router.refresh() })
  }

  if (placeholders.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/60 via-red-900/50 to-rose-900/60 backdrop-blur-md" />
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl p-7 w-full max-w-sm shadow-2xl shadow-black/30 border border-white/40">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-brand">
              <Flame className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-2xl font-bold text-stone-900 tracking-tight">¿Quién sos?</h2>
          </div>
          <p className="text-sm text-stone-500 mt-2 leading-relaxed">
            Elegí tu nombre para vincular tus datos al asado
          </p>
        </div>

        {error && (
          <div className="text-xs text-rose-600 text-center mb-4 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3 font-semibold">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2.5 justify-center mb-6">
          {placeholders.map((p, i) => {
            const color = BUBBLE_COLORS[i % BUBBLE_COLORS.length]
            const isSelected = selected === p.id
            return (
              <button
                key={p.id}
                onClick={() => handleClaim(p.id)}
                disabled={isPending}
                className={`px-5 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r ${color} text-white shadow-sm transition-all duration-200 ${
                  isSelected ? 'scale-95 opacity-70' : 'hover:scale-105 hover:shadow-md active:scale-95'
                } disabled:cursor-wait`}
              >
                {p.name}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleSkip}
          disabled={isPending}
          className="w-full text-xs text-stone-400 hover:text-stone-600 transition-colors py-2 font-medium disabled:opacity-50"
        >
          No soy ninguno de estos →
        </button>
      </div>
    </div>
  )
}
