import { BarChart3, Users, CheckCircle2, Clock, XCircle, Package } from 'lucide-react'
import { EventGuest, Category } from '@/lib/types'
import CategoryIcon from '@/components/lista/CategoryIcon'

interface Props {
  guests: EventGuest[]
  categories: Category[]
}

const CATEGORY_COLORS = [
  'from-orange-400 to-rose-500',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-pink-500',
  'from-rose-400 to-red-500',
]

export default function EventSummary({ guests, categories }: Props) {
  const totalPeople = guests.reduce((sum, g) => sum + 1 + (g.plus_ones ?? 0), 0)
  const coming = guests.filter(g => g.status === 'arrived' || g.status === 'on_way').length
  const pending = guests.filter(g => g.status === 'pending').length
  const notGoing = guests.filter(g => g.status === 'not_going').length

  const totalItems = categories.reduce((sum, c) => sum + (c.items?.length || 0), 0)
  const maxCount = Math.max(1, ...categories.map(c => c.items?.length || 0))

  const stats = [
    { label: 'Personas', value: totalPeople, icon: Users, color: 'text-orange-500', bg: 'bg-orange-100' },
    { label: 'Vienen', value: coming, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { label: 'Pendientes', value: pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100' },
    { label: 'No vienen', value: notGoing, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-100' },
  ]

  return (
    <div className="bg-white rounded-3xl shadow-card-md border border-stone-100 p-5">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-rose-100 rounded-xl flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
        </div>
        <span className="font-display font-bold text-stone-800 text-sm">Resumen</span>
      </div>

      {/* Guest stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        {stats.map(stat => (
          <div key={stat.label} className="bg-stone-50 rounded-2xl border border-stone-100 p-3 flex flex-col items-center text-center gap-1">
            <div className={`w-8 h-8 ${stat.bg} rounded-xl flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} strokeWidth={1.75} />
            </div>
            <span className="font-display font-bold text-stone-800 text-xl tabular-nums leading-none mt-0.5">{stat.value}</span>
            <span className="text-[11px] text-stone-400 font-medium leading-none">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Category bar chart */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.75} />
          <span className="text-xs font-bold text-stone-600">Items por categoría</span>
        </div>
        <span className="text-[11px] text-stone-400 font-medium">{totalItems} en total</span>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center py-6 gap-2">
          <Package className="w-5 h-5 text-stone-300" strokeWidth={1.5} />
          <p className="text-xs text-stone-400 font-medium">Sin categorías aún</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {categories.map((cat, i) => {
            const count = cat.items?.length || 0
            const pct = Math.round((count / maxCount) * 100)
            const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length]
            return (
              <div key={cat.id} className="flex items-center gap-2.5">
                {/* Label */}
                <div className="flex items-center gap-1.5 w-24 flex-shrink-0 min-w-0">
                  <CategoryIcon name={cat.icon} className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-stone-600 truncate">{cat.name}</span>
                </div>
                {/* Bar track */}
                <div className="flex-1 h-5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500 flex items-center justify-end`}
                    style={{ width: count > 0 ? `${Math.max(pct, 12)}%` : '0%' }}
                  >
                    {count > 0 && (
                      <span className="text-[10px] font-bold text-white px-2 tabular-nums">{count}</span>
                    )}
                  </div>
                </div>
                {count === 0 && <span className="text-[10px] font-bold text-stone-300 tabular-nums w-4 flex-shrink-0">0</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
