import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AuthCard from '../../components/AuthCard/AuthCard'
import TextField from '../../components/TextField/TextField'
import Button from '../../components/Button/Button'
import { useAuth } from '../../context/AuthContext'
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from '../../components/Icons/Icons'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Unable to sign in. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      footer={
        <>
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="auth-body" style={{ marginTop: 0 }}>
        {error && <div className="auth-error">{error}</div>}

        <TextField
          label="Email"
          type="email"
          icon={<MailIcon width={16} height={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <div>
          <div className="auth-row-between">
            <label className="field-label" style={{ marginBottom: 6, display: 'block' }}>
              Password
            </label>
            <Link to="/forgot-password" className="auth-link">
              Forgot password?
            </Link>
          </div>
          <TextField
            type={showPassword ? 'text' : 'password'}
            icon={<LockIcon width={16} height={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            rightSlot={
              <span onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? <EyeOffIcon width={16} height={16} /> : <EyeIcon width={16} height={16} />}
              </span>
            }
          />
        </div>

        <Button type="submit" className="btn-block" loading={loading}>
          Sign In →
        </Button>
      </form>
    </AuthCard>
  )
}
