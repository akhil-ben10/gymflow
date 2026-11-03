import { supabase } from '../lib/supabaseClient'

// All service queries scope through gym_id. RLS remains the final authorization boundary.
export async function listMembers(gymId) {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured') }
  return supabase.from('gym_members').select('*, membership_plans(name, price)').eq('gym_id', gymId).order('created_at', { ascending: false })
}
export async function createMember(gymId, member) {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured') }
  return supabase.from('gym_members').insert({ ...member, gym_id: gymId }).select().single()
}
export async function recordPayment(gymId, payment) {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured') }
  return supabase.from('payments').insert({ ...payment, gym_id: gymId, source: payment.source || 'manual' }).select().single()
}
export async function checkInMember(gymId, memberId) {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured') }
  return supabase.from('attendance').insert({ gym_id: gymId, member_id: memberId }).select().single()
}
