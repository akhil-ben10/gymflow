import Icon from './Icon'

export default function StatCard({ icon, label, value, change, detail, tone }) {
  return <article className="stat-card"><div className={`stat-icon stat-icon--${tone}`}><Icon name={icon} size={20} /></div><div className="stat-label">{label}<span className="info">i</span></div><div className="stat-value">{value}</div><div className="stat-foot"><span className="change"><Icon name="trend" size={14} /> {change}</span><span>{detail}</span></div></article>
}
