import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import {
  checkInMember,
  checkOutAttendance,
  createMember,
  deleteMember as deleteMemberRequest,
  listAttendance,
  listMembers,
  listPayments,
  listPlans,
  loadWorkspace,
  recordPayment as recordPaymentRequest,
  updateGym,
  updateMember as updateMemberRequest,
} from '../services/gymService'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export function AppProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [gym, setGym] = useState(null)
  const [members, setMembers] = useState([])
  const [payments, setPayments] = useState([])
  const [attendance, setAttendance] = useState([])
  const [plans, setPlans] = useState([])
  const [authLoading, setAuthLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState(!isSupabaseConfigured ? 'Supabase is not configured. Add your project URL and publishable key.' : '')
  const [toast, setToast] = useState(null)

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3200)
  }, [])

  const refreshData = useCallback(async (gymId) => {
    setDataLoading(true)
    setError('')
    try {
      const [nextMembers, nextPayments, nextAttendance, nextPlans] = await Promise.all([
        listMembers(gymId),
        listPayments(gymId),
        listAttendance(gymId),
        listPlans(gymId),
      ])
      setMembers(nextMembers)
      setPayments(nextPayments)
      setAttendance(nextAttendance)
      setPlans(nextPlans)
    } catch (requestError) {
      setError(requestError.message || 'Unable to load your workspace data.')
      setMembers([])
      setPayments([])
      setAttendance([])
      setPlans([])
    } finally {
      setDataLoading(false)
    }
  }, [])

  const loadWorkspaceData = useCallback(async (user) => {
    if (!user) return
    setDataLoading(true)
    setError('')
    try {
      const workspace = await loadWorkspace(user.id)
      setProfile(workspace.profile)
      setGym(workspace.gym)
      await refreshData(workspace.gym.id)
    } catch (requestError) {
      setProfile(null)
      setGym(null)
      setMembers([])
      setPayments([])
      setAttendance([])
      setPlans([])
      setError(requestError.message || 'Unable to load your workspace.')
    } finally {
      setDataLoading(false)
    }
  }, [refreshData])

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false)
      return undefined
    }

    let mounted = true
    const initialize = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (!mounted) return
      if (sessionError) {
        setError(sessionError.message)
        setAuthLoading(false)
        return
      }
      setSession(data.session)
      setAuthLoading(false)
      if (data.session) await loadWorkspaceData(data.session.user)
    }

    initialize()
    const { data: listener } = supabase.auth.onAuthStateChange((_, nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      if (nextSession) {
        window.setTimeout(() => loadWorkspaceData(nextSession.user), 0)
      } else {
        setProfile(null)
        setGym(null)
        setMembers([])
        setPayments([])
        setAttendance([])
        setPlans([])
        setError('')
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [loadWorkspaceData])

  const signOut = useCallback(async () => {
    if (!supabase) return
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      setError(signOutError.message)
      notify(signOutError.message, 'error')
      return
    }
    notify('You have been signed out')
  }, [notify])

  const addMember = useCallback(async (member) => {
    if (!gym) throw new Error('No gym workspace is loaded.')
    try {
      const created = await createMember(gym.id, member)
      setMembers(current => [created, ...current])
      notify('Member added')
      return created
    } catch (requestError) {
      notify(requestError.message || 'Unable to add member.', 'error')
      throw requestError
    }
  }, [gym, notify])

  const updateMember = useCallback(async (id, updates) => {
    if (!gym) throw new Error('No gym workspace is loaded.')
    try {
      const existing = members.find(member => member.id === id) || {}
      const updated = await updateMemberRequest(gym.id, id, { ...existing, ...updates })
      setMembers(current => current.map(member => member.id === id ? updated : member))
      notify('Member details updated')
      return updated
    } catch (requestError) {
      notify(requestError.message || 'Unable to update member.', 'error')
      throw requestError
    }
  }, [gym, members, notify])

  const deleteMember = useCallback(async (id) => {
    if (!gym) throw new Error('No gym workspace is loaded.')
    try {
      await deleteMemberRequest(gym.id, id)
      setMembers(current => current.filter(member => member.id !== id))
      notify('Member removed')
    } catch (requestError) {
      notify(requestError.message || 'Unable to remove member.', 'error')
      throw requestError
    }
  }, [gym, notify])

  const checkIn = useCallback(async (memberId) => {
    if (!gym) throw new Error('No gym workspace is loaded.')
    try {
      const created = await checkInMember(gym.id, memberId)
      setAttendance(current => [created, ...current])
      notify('Member checked in')
      return created
    } catch (requestError) {
      notify(requestError.message || 'Unable to check in member.', 'error')
      throw requestError
    }
  }, [gym, notify])

  const checkOut = useCallback(async (attendanceId) => {
    if (!gym) throw new Error('No gym workspace is loaded.')
    try {
      const updated = await checkOutAttendance(gym.id, attendanceId)
      setAttendance(current => current.map(item => item.id === attendanceId ? updated : item))
      notify('Attendance updated')
      return updated
    } catch (requestError) {
      notify(requestError.message || 'Unable to check out member.', 'error')
      throw requestError
    }
  }, [gym, notify])

  const saveGym = useCallback(async (values) => {
    if (!gym) throw new Error('No gym workspace is loaded.')
    try {
      const updated = await updateGym(gym.id, values)
      setGym(updated)
      notify('Gym profile updated')
      return updated
    } catch (requestError) {
      notify(requestError.message || 'Unable to update gym profile.', 'error')
      throw requestError
    }
  }, [gym, notify])

  const recordPayment = useCallback(async (payment) => {
    if (!gym) throw new Error('No gym workspace is loaded.')
    try {
      const created = await recordPaymentRequest(gym.id, payment)
      setPayments(current => [created, ...current])
      notify('Payment recorded')
      return created
    } catch (requestError) {
      notify(requestError.message || 'Unable to record payment.', 'error')
      throw requestError
    }
  }, [gym, notify])

  const value = useMemo(() => ({
    session,
    profile,
    gym,
    members,
    payments,
    attendance,
    plans,
    authLoading,
    dataLoading,
    loading: authLoading || dataLoading,
    error,
    isDemo: false,
    addMember,
    updateMember,
    deleteMember,
    checkIn,
    checkOut,
    recordPayment,
    saveGym,
    refreshData: () => gym ? refreshData(gym.id) : Promise.resolve(),
    signOut,
    notify,
  }), [session, profile, gym, members, payments, attendance, plans, authLoading, dataLoading, error, addMember, updateMember, deleteMember, checkIn, checkOut, recordPayment, saveGym, refreshData, signOut, notify])

  return <AppContext.Provider value={value}>{children}{toast && <div className={`toast toast--${toast.type}`} role="status">{toast.message}</div>}</AppContext.Provider>
}
