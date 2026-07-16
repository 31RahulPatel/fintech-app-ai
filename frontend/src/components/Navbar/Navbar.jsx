import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../Button/Button'
import { RupeeIcon, ChatIcon, MoonIcon, ChevronDownIcon } from '../Icons/Icons'
import './Navbar.css'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-logo">
          <RupeeIcon width={20} height={20} stroke="#fff" />
        </span>
        FintechOps
      </Link>

      <nav className="navbar-links">
        <Link to="/dashboard" className="navbar-link navbar-link-ai">
          <ChatIcon width={16} height={16} />
          <span className="navbar-link-label">Bazar.ai</span>
          <span className="navbar-ai-badge">AI</span>
        </Link>
      </nav>

      <div className="navbar-actions">
        <button className="navbar-icon-btn" aria-label="Toggle theme" type="button">
          <MoonIcon width={18} height={18} />
        </button>

        {isAuthenticated ? (
          <div className="navbar-user" onClick={() => setMenuOpen((v) => !v)}>
            <span className="navbar-avatar">{(user?.name || user?.email || '?')[0].toUpperCase()}</span>
            <span className="navbar-username">{user?.name || user?.email?.split('@')[0]}</span>
            <ChevronDownIcon width={14} height={14} />
            {menuOpen && (
              <div className="navbar-dropdown">
                <Link to="/dashboard">Dashboard</Link>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="navbar-login">
              Login
            </Link>
            <Button onClick={() => navigate('/signup')}>Get Started</Button>
          </>
        )}
      </div>
    </header>
  )
}
