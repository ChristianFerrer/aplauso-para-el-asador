'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addListItem(data: {
  categoryId: string
  itemName: string
  quantity: number
  unit: string
  notes: string
  overrideUserId?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('list_items').insert({
    category_id: data.categoryId,
    user_id: data.overrideUserId || user.id,
    item_name: data.itemName,
    quantity: data.quantity,
    unit: data.unit,
    notes: data.notes,
  })

  if (error) return { error: error.message }

  revalidatePath('/es/lista')
  revalidatePath('/en/lista')
  revalidatePath('/es')
  revalidatePath('/en')
  return { success: true }
}

export async function deleteListItem(itemId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('list_items').delete().eq('id', itemId)
  if (error) return { error: error.message }
  revalidatePath('/es/lista')
  revalidatePath('/en/lista')
  revalidatePath('/es')
  revalidatePath('/en')
  return { success: true }
}

export async function claimIdentity(placeholderProfileId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const { error } = await supabase.rpc('claim_identity', { placeholder_profile_id: placeholderProfileId })
  if (error) return { error: error.message }
  revalidatePath('/es')
  revalidatePath('/en')
  return { success: true }
}

export async function skipIdentityClaim() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const { error } = await supabase.from('profiles').update({ identity_claimed: true }).eq('id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/es')
  revalidatePath('/en')
  return { success: true }
}

export async function addCategory(eventId: string, name: string, icon: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const { data: last } = await supabase
    .from('categories').select('sort_order').eq('event_id', eventId)
    .order('sort_order', { ascending: false }).limit(1)
  const nextOrder = last && last.length > 0 ? last[0].sort_order + 1 : 0
  const { error } = await supabase.from('categories').insert({ event_id: eventId, name, icon, sort_order: nextOrder })
  if (error) return { error: error.message }
  revalidatePath('/es'); revalidatePath('/en')
  revalidatePath('/es/lista'); revalidatePath('/en/lista')
  return { success: true }
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('categories').delete().eq('id', categoryId)
  if (error) return { error: error.message }
  revalidatePath('/es'); revalidatePath('/en')
  revalidatePath('/es/lista'); revalidatePath('/en/lista')
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

export async function createPlaceholderGuest(eventId: string, name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const { data, error } = await supabase.rpc('create_placeholder_guest', {
    p_event_id: eventId,
    p_name: name.trim(),
  })
  if (error) return { error: error.message }
  revalidatePath('/es'); revalidatePath('/en')
  return { success: true, profileId: data }
}

export async function updateProfileName(profileId: string, name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const { error } = await supabase.from('profiles').update({ name: name.trim() }).eq('id', profileId)
  if (error) return { error: error.message }
  revalidatePath('/es'); revalidatePath('/en')
  return { success: true }
}

export async function removeFromEvent(userId: string, eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const { error } = await supabase.from('event_guests').delete().eq('user_id', userId).eq('event_id', eventId)
  if (error) return { error: error.message }
  revalidatePath('/es'); revalidatePath('/en')
  return { success: true }
}

export async function deletePlaceholderUser(profileId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const { error } = await supabase.rpc('delete_placeholder_user', { p_profile_id: profileId })
  if (error) return { error: error.message }
  revalidatePath('/es'); revalidatePath('/en')
  return { success: true }
}
