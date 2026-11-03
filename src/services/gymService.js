import { supabase } from '../lib/supabaseClient'

const configuredError = () => new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')

function clientOrThrow() {
  if (!supabase) throw configuredError()
  return supabase
}

async function unwrap(request) {
  const { data, error } = await request
  if (error) throw error
  return data
}

function displayDate(value) {
  if (!value) return '—'
  const parsed = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value)
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function displayTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function avatarTone(id = '') {
  const tones = ['purple', 'blue', 'green', 'orange', 'pink']
  return tones[[...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % tones.length]
}

export function mapMember(row) {
  return {
    ...row,
    plan: row.membership_plans?.name || 'No plan',
    joined: row.membership_start || row.created_at?.slice(0, 10) || '—',
    expiry: row.membership_expiry || '—',
    tone: avatarTone(row.id),
  }
}

export function mapPlan(row) {
  const duration = Number(row.duration_months)
  return {
    ...row,
    interval: duration === 12 ? 'Annual' : `${duration} month${duration === 1 ? '' : 's'}`,
    members: row.member_count ?? 0,
    color: avatarTone(row.id),
  }
}

export function mapAttendance(row) {
  return {
    ...row,
    member: row.gym_members?.full_name || 'Unknown member',
    checkIn: displayTime(row.checked_in_at),
    checkOut: displayTime(row.checked_out_at),
    date: row.checked_in_at ? new Date(row.checked_in_at).toLocaleDateString() : '—',
    status: row.checked_out_at ? 'checked-out' : 'checked-in',
  }
}

export function mapPayment(row) {
  return {
    ...row,
    member: row.gym_members?.full_name || 'Unassigned',
    amount: Number(row.amount || 0),
    date: displayDate(row.paid_at || row.created_at?.slice(0, 10)),
  }
}

export function memberPayload(member, gymId) {
  return {
    gym_id: gymId,
    full_name: member.full_name?.trim(),
    email: member.email?.trim(),
    phone: member.phone?.trim(),
    gender: member.gender || null,
    date_of_birth: member.date_of_birth || null,
    address: member.address || null,
    emergency_contact: member.emergency_contact || null,
    plan_id: member.plan_id || null,
    membership_start: member.membership_start || member.joined || null,
    membership_expiry: member.membership_expiry || member.expiry || null,
    status: member.status || 'active',
    notes: member.notes || null,
  }
}

export async function loadWorkspace(userId) {
  const client = clientOrThrow()
  const [profile, gym] = await Promise.all([
    unwrap(client.from('profiles').select('*').eq('id', userId).maybeSingle()),
    unwrap(client.from('gyms').select('*').order('created_at', { ascending: true }).limit(1).maybeSingle()),
  ])
  if (!profile) throw new Error('Your user profile could not be found.')
  if (!gym) throw new Error('No gym workspace is associated with this account.')
  return { profile, gym }
}

export async function updateGym(gymId, values) {
  const client = clientOrThrow()
  return unwrap(client.from('gyms').update({
    name: values.name?.trim(),
    email: values.email?.trim() || null,
    phone: values.phone?.trim() || null,
    address: values.address?.trim() || null,
    timezone: values.timezone,
    updated_at: new Date().toISOString(),
  }).eq('id', gymId).select('*').single())
}

export async function listPlans(gymId) {
  const client = clientOrThrow()
  const rows = await unwrap(client.from('membership_plans').select('*').eq('gym_id', gymId).eq('is_active', true).order('created_at', { ascending: true }))
  return (rows || []).map(mapPlan)
}

export async function listMembers(gymId) {
  const client = clientOrThrow()
  const rows = await unwrap(client.from('gym_members').select('*, membership_plans(name, price)').eq('gym_id', gymId).order('created_at', { ascending: false }))
  return (rows || []).map(mapMember)
}

export async function createMember(gymId, member) {
  const client = clientOrThrow()
  const row = await unwrap(client.from('gym_members').insert(memberPayload(member, gymId)).select('*, membership_plans(name, price)').single())
  return mapMember(row)
}

export async function updateMember(gymId, memberId, member) {
  const client = clientOrThrow()
  const row = await unwrap(client.from('gym_members').update(memberPayload(member, gymId)).eq('id', memberId).eq('gym_id', gymId).select('*, membership_plans(name, price)').single())
  return mapMember(row)
}

export async function deleteMember(gymId, memberId) {
  const client = clientOrThrow()
  await unwrap(client.from('gym_members').delete().eq('id', memberId).eq('gym_id', gymId))
}

export async function listAttendance(gymId) {
  const client = clientOrThrow()
  const rows = await unwrap(client.from('attendance').select('*, gym_members(full_name)').eq('gym_id', gymId).order('checked_in_at', { ascending: false }))
  return (rows || []).map(mapAttendance)
}

export async function checkInMember(gymId, memberId) {
  const client = clientOrThrow()
  const row = await unwrap(client.from('attendance').insert({ gym_id: gymId, member_id: memberId }).select('*, gym_members(full_name)').single())
  return mapAttendance(row)
}

export async function checkOutAttendance(gymId, attendanceId) {
  const client = clientOrThrow()
  const row = await unwrap(client.from('attendance').update({ checked_out_at: new Date().toISOString() }).eq('id', attendanceId).eq('gym_id', gymId).select('*, gym_members(full_name)').single())
  return mapAttendance(row)
}

export async function listPayments(gymId) {
  const client = clientOrThrow()
  const rows = await unwrap(client.from('payments').select('*, gym_members(full_name)').eq('gym_id', gymId).order('created_at', { ascending: false }))
  return (rows || []).map(mapPayment)
}

export async function recordPayment(gymId, payment) {
  const client = clientOrThrow()
  const row = await unwrap(client.from('payments').insert({
    gym_id: gymId,
    member_id: payment.member_id || null,
    amount: Number(payment.amount),
    method: payment.method?.trim(),
    status: payment.status || 'paid',
    paid_at: payment.status === 'paid' ? (payment.paid_at || new Date().toISOString()) : (payment.paid_at || null),
    external_reference: payment.external_reference || null,
    source: 'manual',
  }).select('*, gym_members(full_name)').single())
  return mapPayment(row)
}
