import { Link } from 'react-router-dom'
import { RupeeIcon } from '../Icons/Icons'
import './AuthCard.css'

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <span className="auth-logo">
            <RupeeIcon width={22} height={22} stroke="#fff" />
          </span>
          FintechOps
        </Link>

        <h1 className="auth-title">{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}

        <div className="auth-body">{children}</div>

        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  )
}
