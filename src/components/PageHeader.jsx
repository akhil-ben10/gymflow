import { Link } from 'react-router-dom'
import Icon from './Icon'
export default function PageHeader({ eyebrow, title, description, action, actionTo, children }) { return <section className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="subtitle">{description}</p>}</div>{children || (action && <Link className="primary-button" to={actionTo || '#'}><Icon name="plus" size={16} />{action}</Link>)}</section> }
