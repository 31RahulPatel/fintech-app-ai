import { useState } from 'react'
import TextField from '../../../../components/TextField/TextField'
import Button from '../../../../components/Button/Button'
import { CloseIcon } from '../../../../components/Icons/Icons'
import './CreateAgentModal.css'

const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Cron']
const TIMEZONES = ['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London', 'Asia/Singapore']

export default function CreateAgentModal({ onClose, onSubmit, submitting }) {
  const [form, setForm] = useState({
    name: '',
    prompt: '',
    frequency: 'Daily',
    time: '09:00',
    cronExpression: '',
    timezone: 'Asia/Kolkata',
    delivery: 'Email',
  })
  const [error, setError] = useState('')

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.prompt.trim()) {
      setError('Agent name and prompt are required.')
      return
    }
    if (form.frequency === 'Cron' && !form.cronExpression.trim()) {
      setError('Enter a valid cron expression.')
      return
    }

    try {
      await onSubmit(form)
    } catch (err) {
      setError(err.message || 'Could not create the schedule.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Schedule</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="auth-error">{error}</div>}

          <TextField label="Agent name" value={form.name} onChange={update('name')} placeholder="Nifty 50 shares" required />

          <div className="field">
            <label className="field-label">Prompt</label>
            <textarea
              className="modal-textarea"
              rows={3}
              value={form.prompt}
              onChange={update('prompt')}
              placeholder="Summarize today's Nifty 50 top gainers and losers in a table."
              required
            />
          </div>

          <div className="modal-grid">
            <div className="field">
              <label className="field-label">Frequency</label>
              <select className="modal-select" value={form.frequency} onChange={update('frequency')}>
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {form.frequency === 'Cron' ? (
              <TextField label="Cron expression" value={form.cronExpression} onChange={update('cronExpression')} placeholder="0 9 * * ? *" />
            ) : (
              <TextField label="Time" type="time" value={form.time} onChange={update('time')} />
            )}
          </div>

          <div className="modal-grid">
            <div className="field">
              <label className="field-label">Timezone</label>
              <select className="modal-select" value={form.timezone} onChange={update('timezone')}>
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field-label">Delivery</label>
              <select className="modal-select" value={form.delivery} onChange={update('delivery')}>
                <option value="Email">Email</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Create schedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
