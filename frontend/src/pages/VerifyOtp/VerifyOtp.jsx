import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import AuthCard from '../../components/AuthCard/AuthCard'
import TextField from '../../components/TextField/TextField'
import Button from '../../components/Button/Button'
import { confirmSignUp, resendConfirmationCode } from '../../lib/cognitoClient'
import './VerifyOtp.css'

export default function VerifyOtp() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ''

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await confirmSignUp(email, otp)
      navigate('/login', { state: { verified: true } })
    } catch (err) {
      setError(err.message || 'Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setInfo('')
    setResending(true)
    try {
      await resendConfirmationCode(email)
      setInfo('A new code has been sent to your email.')
    } catch (err) {
      setError(err.message || 'Could not resend code.')
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthCard
      title="Verify your email"
      subtitle={email ? `Enter the 6-digit code sent to ${email}` : 'Enter the 6-digit code sent to your email'}
      footer={<Link to="/login">Back to sign in</Link>}
    >
      <form onSubmit={handleSubmit} className="auth-body" style={{ marginTop: 0 }}>
        {error && <div className="auth-error">{error}</div>}
        {info && <div className="otp-info">{info}</div>}

        <TextField
          label="Verification code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456"
          inputMode="numeric"
          className="otp-input"
          required
        />

        <Button type="submit" className="btn-block" loading={loading}>
          Verify account
        </Button>

        <button type="button" className="otp-resend" onClick={handleResend} disabled={resending}>
          {resending ? 'Resending…' : "Didn't get a code? Resend"}
        </button>
      </form>
    </AuthCard>
  )
}
