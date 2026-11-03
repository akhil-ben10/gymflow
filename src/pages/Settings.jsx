import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'
import { useApp } from '../context/AppContext'

export default function Settings() {
  const { gym, saveGym, loading, error } = useApp()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', timezone: 'UTC', address: '' })
  useEffect(() => { if (gym) setForm({ name: gym.name || '', email: gym.email || '', phone: gym.phone || '', timezone: gym.timezone || 'UTC', address: gym.address || '' }) }, [gym])
  const submit = async event => {
    event.preventDefault()
    setSaving(true)
    try { await saveGym(form); setSaved(true) } catch { setSaved(false) } finally { setSaving(false) }
  }
  return <><PageHeader eyebrow="Workspace / Manage" title="Settings" description="Configure your gym workspace and subscription preferences."/><div className="settings-grid"><div className="settings-nav"><button className="settings-tab settings-tab--active"><Icon name="users" size={17}/> Gym profile</button><button disabled className="settings-tab"><Icon name="shield" size={17}/> Security & access</button><button disabled className="settings-tab"><Icon name="wallet" size={17}/> Subscription & billing</button><button disabled className="settings-tab"><Icon name="bell" size={17}/> Notifications</button></div><div className="panel settings-panel"><div className="panel-header"><div><h2>Gym profile</h2><p>These details appear across your workspace.</p></div></div>{loading && !gym ? <div className="empty-state"><strong>Loading gym profile…</strong></div> : error && !gym ? <div className="empty-state"><strong>Unable to load gym profile</strong><span>{error}</span></div> : <form className="settings-form" onSubmit={submit}><label>Gym name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></label><label>Business email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></label><label>Phone number<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}/></label><label>Timezone<select value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}><option value="UTC">UTC</option><option value="America/New_York">Eastern Time (ET)</option><option value="America/Chicago">Central Time (CT)</option><option value="America/Los_Angeles">Pacific Time (PT)</option></select></label><label className="full-field">Address<textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}/></label><button disabled={saving} className="primary-button" type="submit">{saving ? 'Saving…' : saved ? <><Icon name="check" size={15}/> Saved</> : 'Save changes'}</button></form>}</div></div><div className="billing-callout panel"><div className="billing-icon"><Icon name="shield" size={20}/></div><div><span>Current plan · {gym?.subscription_status || 'Unknown'}</span><h2>{gym?.subscription_plan || 'Plan unavailable'}</h2><p>Subscription details are managed by your GymFlow account.</p></div><button disabled className="secondary-button">Manage subscription <Icon name="arrow" size={14}/></button></div></>
}
