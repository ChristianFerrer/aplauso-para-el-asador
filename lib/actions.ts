'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addListItem(data: {
  categoryId: string
  itemName: string
  quantity: number
  unit: string
  notes: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('list_items').insert({
    category_id: data.categoryId,
    user_id: user.id,
    item_name: data.itemName,
    quantity: data.quantity,
    unit: data.unit,
    notes: data.notes,
  })

  if (error) return { error: error.message }

  revalidatePath('/es/lista')
  revalidatePath('/en/lista')
  return { success: true }
}

export async function deleteListItem(itemId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('list_items').delete().eq('id', itemId)
  if (error) return { error: error.message }
  revalidatePath('/es/lista')
  revalidatePath('/en/lista')
  return { success: true }
}

export async function updatePlusOnes(eventId: string, userId: string, plusOnes: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('event_guests')
    .update({ plus_ones: Math.max(0, plusOnes), updated_at: new Date().toISOString() })
    .eq('event_id', eventId)
    .eq('user_id', userId)
  if (error) return { error: error.message }
  revalidatePath('/es')
  revalidatePath('/en')
  return { success: true }
}

export async function updateAttendance(eventId: string, userId: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('event_guests').upsert({
    event_id: eventId,
    user_id: userId,
    status,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'event_id,user_id' })
  if (error) return { error: error.message }
  revalidatePath('/es')
  revalidatePath('/en')
  return { success: true }
}
