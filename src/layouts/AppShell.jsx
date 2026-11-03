import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Icon from '../components/Icon'
import { useApp } from '../context/AppContext'

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isDemo } = useApp()
  const location = useLocation(); const navigate = useNavigate()
  const title = location.pathname.split('/')[1]?.replace('-', ' ') || 'dashboard'
  return <div className="app-shell"><Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} /><main className="main-content"><header className="topbar"><div className="mobile-title"><span className="brand-mark">G</span>Gym<span>Flow</span></div><div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{title.charAt(0).toUpperCase() + title.slice(1)}</strong></div><div className="topbar-actions"><span className="demo-pill">{isDemo ? 'Demo mode' : 'Live workspace'}</span><button className="icon-button notification" aria-label="Notifications"><Icon name="bell" size={19} /><i /></button><div className="avatar avatar--purple">JD</div><span className="topbar-name">Jordan Davis</span><Icon name="down" size={14} className="topbar-chevron" /></div><button className="mobile-menu icon-button" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Icon name="menu" size={21} /></button></header><div className="page-body">{isDemo && <div className="demo-notice"><span className="demo-dot" /><strong>Demo workspace</strong><span>You're viewing sample data. Connect your gym to see real-time insights.</span><button onClick={() => navigate('/settings')}>Configure Supabase <Icon name="arrow" size={14} /></button></div>}<Outlet /></div></main></div>
}
