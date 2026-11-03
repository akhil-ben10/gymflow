import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

export default function ProtectedRoute() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])
  if (!isSupabaseConfigured) return <Outlet />
  if (loading) return <div className="route-loading">Loading your workspace…</div>
  return session ? <Outlet /> : <Navigate to="/login" replace />
}
