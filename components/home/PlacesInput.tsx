'use client'

import { useEffect, useRef } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

declare global {
  interface Window { google: any }
}

export default function PlacesInput({ value, onChange, placeholder, className }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    if (!apiKey || !ref.current) return

    function attach() {
      if (!ref.current || !window.google?.maps?.places) return
      const ac = new window.google.maps.places.Autocomplete(ref.current, {
        types: ['geocode', 'establishment'],
        fields: ['formatted_address', 'name'],
      })
      ac.addListener('place_changed', () => {
        const place = ac.getPlace()
        onChange(place.formatted_address || place.name || '')
      })
    }

    if (window.google?.maps?.places) { attach(); return }

    const existing = document.querySelector('[data-gmaps-script]')
    if (existing) { existing.addEventListener('load', attach); return }

    const s = document.createElement('script')
    s.setAttribute('data-gmaps-script', '')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    s.async = true; s.defer = true
    s.onload = attach
    document.head.appendChild(s)
  }, [apiKey, onChange])

  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      autoComplete="off"
    />
  )
}
