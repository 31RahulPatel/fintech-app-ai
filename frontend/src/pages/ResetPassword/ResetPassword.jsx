import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import AuthCard from '../../components/AuthCard/AuthCard'
import TextField from '../../components/TextField/TextField'
import Button from '../../components/Button/Button'
import { confirmPassword } from '../../lib/cognitoClient'
import { LockIcon } from '../../components/Icons/Icons'

export default function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ''

  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      await confirmPassword(email, otp, newPassword)
      navigate('/login', { state: { reset: true } })
    } catch (err) {
      setError(err.message || 'Could not reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle={email ? `Enter the code sent to ${email} and a new password` : 'Enter the code and your new password'}
      footer={<Link to="/login">Back to sign in</Link>}
    >
      <form onSubmit={handleSubmit} className="auth-body" style={{ marginTop: 0 }}>
        {error && <div className="auth-error">{error}</div>}

        <TextField
          label="Reset code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456"
          required
        />

        <TextField
          label="New password"
          type="password"
          icon={<LockIcon width={16} height={16} />}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
          required
        />

        <Button type="submit" className="btn-block" loading={loading}>
          Reset password
        </Button>
      </form>
    </AuthCard>
  )
}
