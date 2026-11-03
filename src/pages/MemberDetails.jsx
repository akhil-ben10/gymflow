import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'
import { useApp } from '../context/AppContext'

export default function MemberDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { members, payments, updateMember, deleteMember, loading, error } = useApp()
  const member = members.find(item => item.id === id)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(null)
  if (loading && !member) return <div className="empty-state"><strong>Loading member…</strong></div>
  if (!member) return <div className="empty-state"><strong>Member not found</strong><span>{error || 'This member may have been removed.'}</span><Link className="secondary-button" to="/members">Back to members</Link></div>
  const values = form || member
  const memberPayments = payments.filter(payment => payment.member_id === member.id)
  const save = async event => {
    event.preventDefault()
    setSaving(true)
    try { await updateMember(member.id, form || member); setForm(null) } catch { /* provider shows error */ } finally { setSaving(false) }
  }
  const remove = async () => {
    if (!window.confirm(`Remove ${member.full_name}?`)) return
    await deleteMember(member.id)
    navigate('/members')
  }
  return <><PageHeader eyebrow="Members / Profile" title={member.full_name} description="Member profile, membership status and payment history."><div className="header-actions"><Link className="secondary-button" to="/members"><Icon name="arrow" size={15}/> Back to members</Link><button className="primary-button" onClick={() => setForm({ ...member, status: member.status === 'active' ? 'expired' : 'active' })}><Icon name="edit" size={15}/> Edit member</button></div></PageHeader><div className="profile-grid"><div className="panel profile-card"><div className="profile-hero"><div className={`profile-avatar avatar--${member.tone}`}>{member.full_name.split(' ').map(n => n[0]).join('')}</div><div><h2>{member.full_name}</h2><p>{member.email}</p><span className={`status status--${member.status}`}><i/>{member.status} member</span></div></div>{form ? <form className="settings-form" onSubmit={save}><label>Full name<input required value={values.full_name} onChange={e => setForm({ ...values, full_name: e.target.value })}/></label><label>Email<input required type="email" value={values.email} onChange={e => setForm({ ...values, email: e.target.value })}/></label><label>Phone<input required value={values.phone} onChange={e => setForm({ ...values, phone: e.target.value })}/></label><label>Status<select value={values.status} onChange={e => setForm({ ...values, status: e.target.value })}><option value="active">Active</option><option value="expired">Expired</option><option value="paused">Paused</option></select></label><label>Expiry date<input type="date" value={values.membership_expiry || ''} onChange={e => setForm({ ...values, membership_expiry: e.target.value })}/></label><label className="full-field">Notes<textarea value={values.notes || ''} onChange={e => setForm({ ...values, notes: e.target.value })}/></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setForm(null)}>Cancel</button><button disabled={saving} className="primary-button">{saving ? 'Saving…' : 'Save changes'}</button></div></form> : <><div className="profile-details"><div><small>Phone number</small><strong>{member.phone}</strong></div><div><small>Membership plan</small><strong>{member.plan}</strong></div><div><small>Member since</small><strong>{member.joined}</strong></div><div><small>Membership expiry</small><strong>{member.expiry}</strong></div></div><div className="profile-note"><Icon name="shield" size={16}/><span>GymFlow only stores the information needed to manage this membership. No health information is collected.</span></div></>}<button className="danger-button" onClick={remove}><Icon name="trash" size={15}/> Delete member</button></div><div className="panel"><div className="panel-header"><div><h2>Payment history</h2><p>Recorded payment metadata</p></div></div>{memberPayments.length ? <div className="detail-list">{memberPayments.map(payment => <div key={payment.id}><span><strong>{payment.date}</strong><small>{payment.method} · Manually recorded</small></span><b>${payment.amount.toFixed(2)}</b><em className={`status status--${payment.status}`}>{payment.status}</em></div>)}</div> : <div className="empty-state"><strong>No payments recorded</strong><span>Payments for this member will appear here.</span></div>}</div></div></>
}
