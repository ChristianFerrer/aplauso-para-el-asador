export type Role = 'admin' | 'guest'
export type AttendanceStatus = 'arrived' | 'on_way' | 'not_going' | 'pending'

export interface Profile {
  id: string
  name: string
  avatar_url: string | null
  role: Role
  is_placeholder: boolean
  identity_claimed: boolean
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  name: string
  location: string
  description: string
  event_date: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface EventGuest {
  id: string
  event_id: string
  user_id: string
  status: AttendanceStatus
  plus_ones: number
  updated_at: string
  profile?: Profile
}

export interface Category {
  id: string
  event_id: string
  name: string
  icon: string
  sort_order: number
  created_at: string
  items?: ListItem[]
}

export interface ListItem {
  id: string
  category_id: string
  user_id: string | null
  item_name: string
  quantity: number
  unit: string
  notes: string
  created_at: string
  updated_at: string
  profile?: Profile
}
