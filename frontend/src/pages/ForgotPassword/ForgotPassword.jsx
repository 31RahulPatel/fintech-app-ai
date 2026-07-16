import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../../components/AuthCard/AuthCard'
import TextField from '../../components/TextField/TextField'
import Button from '../../components/Button/Button'
import { forgotPassword } from '../../lib/cognitoClient'
import { MailIcon } from '../../components/Icons/Icons'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email)
      navigate('/reset-password', { state: { email } })
    } catch (err) {
      setError(err.message || 'Could not send reset code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset code"
      footer={<Link to="/login">Back to sign in</Link>}
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

        <Button type="submit" className="btn-block" loading={loading}>
          Send reset code
        </Button>
      </form>
    </AuthCard>
  )
}
