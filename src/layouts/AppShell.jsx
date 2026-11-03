import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Icon from '../components/Icon'
import { useApp } from '../context/AppContext'

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { profile, gym, loading, error } = useApp()
  const location = useLocation()
  const title = location.pathname.split('/')[1]?.replace('-', ' ') || 'dashboard'
  const initials = (profile?.full_name || 'GymFlow').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()
  return <div className="app-shell"><Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} /><main className="main-content"><header className="topbar"><div className="mobile-title"><span className="brand-mark">G</span>Gym<span>Flow</span></div><div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{title.charAt(0).toUpperCase() + title.slice(1)}</strong></div><div className="topbar-actions"><span className="demo-pill">{loading ? 'Loading workspace' : 'Live workspace'}</span><button className="icon-button notification" aria-label="Notifications"><Icon name="bell" size={19} /><i /></button><div className="avatar avatar--purple">{initials}</div><span className="topbar-name">{profile?.full_name || 'Workspace user'}</span><Icon name="down" size={14} className="topbar-chevron" /></div><button className="mobile-menu icon-button" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Icon name="menu" size={21} /></button></header><div className="page-body">{error && <div className="demo-notice"><span className="demo-dot" /><strong>Workspace unavailable</strong><span>{error}</span></div>}<Outlet /></div></main></div>
}
