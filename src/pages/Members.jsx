import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import { useApp } from '../context/AppContext'
import { validateMember } from '../utils/validation'

const empty = { full_name: '', email: '', phone: '', plan_id: '', membership_expiry: '', notes: '' }

export default function Members() {
  const { members, plans, addMember, deleteMember, loading, error } = useApp()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const visible = members.filter(member => (member.full_name.toLowerCase().includes(query.toLowerCase()) || member.email.toLowerCase().includes(query.toLowerCase())) && (filter === 'all' || member.status === filter))
  const submit = async event => {
    event.preventDefault()
    const validation = validateMember(form)
    if (validation.plan_id && form.plan_id) delete validation.plan_id
    setFormErrors(validation)
    if (Object.keys(validation).length) return
    setSaving(true)
    try {
      await addMember(form)
      setForm(empty)
      setShowForm(false)
    } catch {
      // The provider displays the persisted request error.
    } finally {
      setSaving(false)
    }
  }
  return <><PageHeader eyebrow="Workspace / People" title="Members" description="Manage your member relationships and membership status."><button className="primary-button" onClick={() => setShowForm(true)}><Icon name="plus" size={16}/> Add member</button></PageHeader><div className="filter-bar"><div className="search-box"><Icon name="search" size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or email..."/></div><select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All members</option><option value="active">Active</option><option value="expired">Expired</option><option value="paused">Paused</option></select><button className="secondary-button" disabled><Icon name="download" size={15}/> Export CSV</button></div><div className="panel"><div className="table-wrap">{loading ? <div className="empty-state"><strong>Loading members…</strong></div> : error ? <div className="empty-state"><strong>Unable to load members</strong><span>{error}</span></div> : <table className="members-table"><thead><tr><th>Member</th><th>Contact</th><th>Membership plan</th><th>Status</th><th>Expiry date</th><th/></tr></thead><tbody>{visible.map(member => <tr key={member.id}><td><Link to={`/members/${member.id}`} className="member-cell member-link"><div className={`avatar avatar--${member.tone}`}>{member.full_name.split(' ').map(n => n[0]).join('')}</div><div><strong>{member.full_name}</strong><small>Joined {member.joined}</small></div></Link></td><td><span>{member.email}</span><small className="table-sub">{member.phone}</small></td><td>{member.plan}</td><td><span className={`status status--${member.status}`}><i/>{member.status}</span></td><td>{member.expiry}</td><td><div className="table-actions"><Link to={`/members/${member.id}`} aria-label="Edit member"><Icon name="edit" size={15}/></Link><button onClick={async () => { if (window.confirm(`Remove ${member.full_name}?`)) await deleteMember(member.id) }} aria-label="Delete member"><Icon name="trash" size={15}/></button></div></td></tr>)}</tbody></table>}{!loading && !error && visible.length === 0 && <div className="empty-state"><Icon name="users" size={28}/><strong>No members found</strong><span>{members.length ? 'Try a different search or filter.' : 'Add your first member to get started.'}</span></div>}</div><div className="pagination"><span>Showing {visible.length} of {members.length} members</span><div><button disabled>‹</button><button className="pagination-active">1</button><button disabled>›</button></div></div></div>{showForm && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setShowForm(false)}><form className="modal" onSubmit={submit}><div className="modal-header"><div><h2>Add new member</h2><p>Member details are stored in your gym workspace.</p></div><button type="button" className="icon-button" onClick={() => setShowForm(false)}><Icon name="close" size={19}/></button></div><div className="form-grid"><label>Full name *<input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="e.g. Alex Morgan"/>{formErrors.full_name && <small className="form-error">{formErrors.full_name}</small>}</label><label>Email address *<input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="alex@email.com"/>{formErrors.email && <small className="form-error">{formErrors.email}</small>}</label><label>Phone number *<input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 (555) 000-0000"/></label><label>Membership plan<select value={form.plan_id} onChange={e => setForm({...form, plan_id: e.target.value})}><option value="">No plan</option>{plans.map(plan => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></label><label>Expiry date<input type="date" value={form.membership_expiry} onChange={e => setForm({...form, membership_expiry: e.target.value})}/></label><label className="full-field">Notes<textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Optional notes..."/></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button disabled={saving} className="primary-button">{saving ? 'Saving…' : 'Add member'}</button></div></form></div>}</>
}
