import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../../components/AuthCard/AuthCard'
import TextField from '../../components/TextField/TextField'
import Button from '../../components/Button/Button'
import { signUp } from '../../lib/cognitoClient'
import { MailIcon, LockIcon, UserIcon, EyeIcon, EyeOffIcon } from '../../components/Icons/Icons'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      await signUp(email, password, name)
      navigate('/verify-otp', { state: { email } })
    } catch (err) {
      setError(err.message || 'Unable to create your account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start making smarter financial decisions today"
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="auth-body" style={{ marginTop: 0 }}>
        {error && <div className="auth-error">{error}</div>}

        <TextField
          label="Full name"
          icon={<UserIcon width={16} height={16} />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          required
        />

        <TextField
          label="Email"
          type="email"
          icon={<MailIcon width={16} height={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          icon={<LockIcon width={16} height={16} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          required
          rightSlot={
            <span onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? <EyeOffIcon width={16} height={16} /> : <EyeIcon width={16} height={16} />}
            </span>
          }
        />

        <Button type="submit" className="btn-block" loading={loading}>
          Create account
        </Button>
      </form>
    </AuthCard>
  )
}
