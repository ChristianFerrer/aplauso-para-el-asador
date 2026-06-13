import {
  Utensils, Flame, Wine, Salad, Cake, Package,
  Cookie, Coffee, Apple, Fish, Beef, ShoppingBag,
} from 'lucide-react'

const icons: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  utensils: Utensils,
  flame: Flame,
  wine: Wine,
  salad: Salad,
  cake: Cake,
  package: Package,
  cheese: Cookie,
  coffee: Coffee,
  apple: Apple,
  fish: Fish,
  beef: Beef,
  'shopping-bag': ShoppingBag,
}

interface Props {
  name: string
  className?: string
}

export default function CategoryIcon({ name, className }: Props) {
  const Icon = icons[name] || Package
  return <Icon className={className} strokeWidth={1.5} />
}
