'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { claimIdentity, skipIdentityClaim } from '@/lib/actions'

interface Placeholder { id: string; name: string }

interface Props {
  initialPlaceholders: Placeholder[]
}

export default function IdentityPicker({ initialPlaceholders }: Props) {
  const router = useRouter()
  const [placeholders, setPlaceholders] = useState(initialPlaceholders)
  const [selected, setSelected] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  // Real-time: remove bubbles as other users claim names
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('identity-claims')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
      }, (payload) => {
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
      if (res?.error) {
        setError(res.error)
        setSelected(null)
      } else {
        router.refresh()
      }
    })
  }

  function handleSkip() {
    startTransition(async () => {
      await skipIdentityClaim()
      router.refresh()
    })
  }

  if (placeholders.length === 0) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🥩</div>
          <h2 className="text-xl font-bold text-stone-900">¿Quién sos?</h2>
          <p className="text-sm text-stone-500 mt-1.5 leading-relaxed">
            Elegí tu nombre para vincular tus datos al asado
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-600 text-center mb-3 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex flex-wrap gap-2.5 justify-center mb-6">
          {placeholders.map(p => (
            <button
              key={p.id}
              onClick={() => handleClaim(p.id)}
              disabled={isPending}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                selected === p.id
                  ? 'bg-brand-600 text-white scale-95 opacity-70'
                  : 'bg-brand-50 text-brand-700 border-2 border-brand-200 hover:bg-brand-500 hover:text-white hover:border-brand-500 hover:scale-105 active:scale-95'
              } disabled:cursor-wait`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <button
          onClick={handleSkip}
          disabled={isPending}
          className="w-full text-xs text-stone-400 hover:text-stone-600 transition-colors py-2 disabled:opacity-50"
        >
          No soy ninguno de estos →
        </button>
      </div>
    </div>
  )
}
