import { NavLink } from 'react-router-dom'
import Icon from '../components/Icon'
import { useApp } from '../context/AppContext'

const links = [
  { label: 'Dashboard', icon: 'grid', to: '/dashboard' },
  { label: 'Members', icon: 'users', to: '/members' },
  { label: 'Attendance', icon: 'calendar', to: '/attendance' },
  { label: 'Membership Plans', icon: 'card', to: '/plans' },
  { label: 'Payments', icon: 'wallet', to: '/payments' },
  { label: 'Reports & Analytics', icon: 'reports', to: '/reports' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { profile, gym, members, signOut } = useApp()
  const initials = (profile?.full_name || 'GymFlow').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()
  return <>{isOpen && <button className="sidebar-overlay" aria-label="Close menu" onClick={onClose} />}<aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
    <NavLink to="/dashboard" className="brand" onClick={onClose}><div className="brand-mark">G</div><span>Gym<span>Flow</span></span></NavLink>
    <div className="workspace"><div className="workspace-avatar">{(gym?.name || 'G')[0]}</div><div><strong>{gym?.name || 'Your gym'}</strong><small>Live workspace</small></div><Icon name="down" size={15} className="workspace-chevron" /></div>
    <nav aria-label="Main navigation"><p className="nav-label">Workspace</p>{links.map(link => <NavLink end={link.to === '/dashboard'} to={link.to} onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`} key={link.label}><Icon name={link.icon} size={18} /><span>{link.label}</span>{link.to === '/members' && <span className="nav-count">{members.length}</span>}</NavLink>)}<p className="nav-label nav-label--bottom">Manage</p><NavLink to="/staff" onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}><Icon name="shield" size={18} /><span>Staff</span></NavLink><NavLink to="/settings" onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}><Icon name="settings" size={18} /><span>Settings</span></NavLink></nav>
    <div className="sidebar-footer"><div className="help-card"><div className="help-icon"><Icon name="help" size={14} /></div><strong>Need a hand?</strong><p>Check out our help center</p><button type="button">Visit help center <Icon name="arrow" size={14} /></button></div><div className="user-profile"><div className="avatar avatar--purple">{initials}</div><div><strong>{profile?.full_name || 'Workspace user'}</strong><small>Live account</small></div><button type="button" className="more-button" onClick={signOut} aria-label="Sign out"><Icon name="log-out" size={16} /></button></div></div>
  </aside></>
}
