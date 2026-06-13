'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { Category, ListItem } from '@/lib/types'
import CategoryIcon from '@/components/lista/CategoryIcon'

interface Props {
  categories: Category[]
}

export default function ListCarousel({ categories }: Props) {
  const [idx, setIdx] = useState(0)

  if (categories.length === 0) return null

  const cat = categories[idx]
  const items = cat.items || []
  const total = categories.reduce((s, c) => s + (c.items?.length || 0), 0)

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Package className="w-4 h-4 text-brand-500" strokeWidth={1.5} />
        <span className="text-sm font-semibold text-stone-700">Lista · {total} items</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setIdx(i => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <span className="text-xs text-stone-400 w-8 text-center">{idx + 1}/{categories.length}</span>
          <button
            onClick={() => setIdx(i => Math.min(categories.length - 1, i + 1))}
            disabled={idx === categories.length - 1}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
        {categories.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setIdx(i)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              i === idx
                ? 'bg-brand-500 text-white'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            <CategoryIcon name={c.icon} className="w-3 h-3" />
            {c.name}
            <span className={i === idx ? 'opacity-70' : 'opacity-50'}>({c.items?.length || 0})</span>
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-1.5 min-h-[80px]">
        {items.length === 0 ? (
          <p className="text-xs text-stone-400 text-center py-8">Sin items en esta categoría</p>
        ) : (
          items.map((item: ListItem) => (
            <div key={item.id} className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-stone-50">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-stone-800">{item.item_name}</span>
                {(item.quantity > 1 || item.unit) && (
                  <span className="text-xs text-stone-400 ml-1.5">×{item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>
                )}
              </div>
              {item.profile?.name && (
                <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full border border-brand-100">
                  {item.profile.name.split(' ')[0]}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Dot navigation */}
      {categories.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3 pt-2">
          {categories.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`rounded-full transition-all duration-200 ${
                i === idx ? 'w-5 h-1.5 bg-brand-500' : 'w-1.5 h-1.5 bg-stone-200 hover:bg-stone-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
