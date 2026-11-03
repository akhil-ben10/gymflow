import { createContext, useContext, useMemo, useState } from 'react'
import { demoAttendance, demoMembers, demoPayments, demoPlans } from '../data/demoData'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export function AppProvider({ children }) {
  const [members, setMembers] = useState(demoMembers)
  const [payments, setPayments] = useState(demoPayments)
  const [attendance, setAttendance] = useState(demoAttendance)
  const [plans, setPlans] = useState(demoPlans)
  const [toast, setToast] = useState(null)
  const notify = (message, type = 'success') => { setToast({ message, type }); window.setTimeout(() => setToast(null), 3200) }
  const addMember = (member) => { const record = { ...member, id: `m-${Date.now()}`, status: 'active', joined: new Date().toISOString().slice(0, 10), tone: 'purple' }; setMembers((current) => [record, ...current]); notify('Member added to demo workspace') }
  const updateMember = (id, updates) => { setMembers((current) => current.map((member) => member.id === id ? { ...member, ...updates } : member)); notify('Member details updated') }
  const deleteMember = (id) => { setMembers((current) => current.filter((member) => member.id !== id)); notify('Member removed from demo workspace') }
  const checkIn = (memberName) => { if (attendance.some((item) => item.member === memberName && item.status === 'checked-in')) { notify('This member is already checked in', 'error'); return } setAttendance((current) => [{ id: `a-${Date.now()}`, member: memberName, checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), checkOut: '—', date: 'Today', status: 'checked-in' }, ...current]); notify(`${memberName} checked in`) }
  const checkOut = (id) => { setAttendance((current) => current.map((item) => item.id === id ? { ...item, checkOut: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'checked-out' } : item)); notify('Attendance updated') }
  const value = useMemo(() => ({ members, payments, attendance, plans, addMember, updateMember, deleteMember, checkIn, checkOut, notify, isDemo: !isSupabaseConfigured, supabase }), [members, payments, attendance, plans, toast])
  return <AppContext.Provider value={value}>{children}{toast && <div className={`toast toast--${toast.type}`} role="status">{toast.message}</div>}</AppContext.Provider>
}
