import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

function AuthShell({ children, title, description }) {
  return <div className="auth-page"><div className="auth-side"><Link to="/" className="brand"><div className="brand-mark">G</div><span>Gym<span>Flow</span></span></Link><div><span className="eyebrow-pill"><i/>Built for better gyms</span><h1>Everything your gym needs to <em>grow.</em></h1><p>Manage your members, payments, and progress from one calm, clear workspace.</p></div><span className="auth-quote">“GymFlow gave us back hours every week.”<small>— Sam, Forge Fitness</small></span></div><div className="auth-form-wrap"><div className="auth-form"><div className="mobile-auth-brand"><Link to="/" className="brand"><div className="brand-mark">G</div><span>Gym<span>Flow</span></span></Link></div><h2>{title}</h2><p>{description}</p>{children}</div></div></div>
}

function ConfigError() {
  return <div className="form-error">Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before signing in.</div>
}

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const submit = async event => {
    event.preventDefault()
    setError('')
    if (!isSupabaseConfigured || !supabase) { setError('Supabase is not configured.'); return }
    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (signInError) { setError(signInError.message); return }
    navigate('/dashboard')
  }
  return <AuthShell title="Welcome back" description="Sign in to your GymFlow workspace."><form onSubmit={submit} className="auth-fields"><label>Email address<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@yourgym.com"/></label><label>Password<span className="label-action"><Link to="/forgot-password">Forgot password?</Link></span><input required minLength="6" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"/></label>{!isSupabaseConfigured && <ConfigError/>}{error && <div className="form-error">{error}</div>}<button disabled={loading || !isSupabaseConfigured} className="primary-button primary-button--full">{loading ? 'Signing in…' : 'Log in'} <Icon name="arrow" size={16}/></button></form><div className="auth-switch">Don't have an account? <Link to="/signup">Create one</Link></div></AuthShell>
}

export function Signup() {
  const [form, setForm] = useState({ name: '', gym: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const submit = async event => {
    event.preventDefault()
    setError('')
    if (!isSupabaseConfigured || !supabase) { setError('Supabase is not configured.'); return }
    setLoading(true)
    const { data, error: signUpError } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.name, gym_name: form.gym } } })
    setLoading(false)
    if (signUpError) { setError(signUpError.message); return }
    if (!data.session) { setError('Check your email to confirm your account before signing in.'); return }
    navigate('/dashboard')
  }
  return <AuthShell title="Create your workspace" description="Start managing your gym in minutes. No credit card required."><form onSubmit={submit} className="auth-fields"><label>Your full name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jordan Davis"/></label><label>Gym name<input required value={form.gym} onChange={e => setForm({ ...form, gym: e.target.value })} placeholder="Forge Fitness"/></label><label>Work email<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@yourgym.com"/></label><label>Password<input required minLength="8" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters"/></label>{!isSupabaseConfigured && <ConfigError/>}{error && <div className="form-error">{error}</div>}<button disabled={loading || !isSupabaseConfigured} className="primary-button primary-button--full">{loading ? 'Creating workspace…' : 'Create workspace'} <Icon name="arrow" size={16}/></button></form><div className="auth-switch">Already have an account? <Link to="/login">Log in</Link></div></AuthShell>
}

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const submit = async event => {
    event.preventDefault()
    setError('')
    if (!supabase) { setError('Supabase is not configured.'); return }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })
    if (resetError) { setError(resetError.message); return }
    setSent(true)
  }
  return <AuthShell title="Reset your password" description="We'll send a secure reset link to your inbox.">{sent ? <div className="success-box"><Icon name="check" size={22}/><strong>Check your inbox</strong><p>If an account exists for {email}, you'll receive a reset link shortly.</p><Link to="/login" className="secondary-button">Back to login</Link></div> : <form onSubmit={submit} className="auth-fields"><label>Email address<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@yourgym.com"/></label>{error && <div className="form-error">{error}</div>}<button disabled={!supabase} className="primary-button primary-button--full">Send reset link <Icon name="arrow" size={16}/></button><div className="auth-switch"><Link to="/login">← Back to login</Link></div></form>}</AuthShell>
}

export function ResetPassword() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()
  const submit = async event => {
    event.preventDefault()
    setError('')
    if (!supabase) { setError('Supabase is not configured.'); return }
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) { setError(updateError.message); return }
    setSaved(true)
    window.setTimeout(() => navigate('/dashboard'), 700)
  }
  return <AuthShell title="Choose a new password" description="Use a secure password for your GymFlow account."><form onSubmit={submit} className="auth-fields"><label>New password<input required minLength="8" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters"/></label>{error && <div className="form-error">{error}</div>}{saved && <div className="success-box">Your password has been updated.</div>}<button className="primary-button primary-button--full">Update password <Icon name="arrow" size={16}/></button></form></AuthShell>
}
