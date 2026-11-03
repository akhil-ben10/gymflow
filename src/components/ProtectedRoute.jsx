import { Navigate, Outlet } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ProtectedRoute() {
  const { session, authLoading, error } = useApp()
  if (authLoading) return <div className="route-loading">Loading your session…</div>
  if (!session) {
    if (error?.includes('Supabase is not configured')) return <div className="route-loading">{error}</div>
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
