import { useState } from 'react'
import { ClockIcon, SendIcon } from '../../../../components/Icons/Icons'
import './ChatInput.css'

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  return (
    <form className="chat-input-bar" onSubmit={submit}>
      <div className="chat-input-wrap">
        <ClockIcon width={18} height={18} className="chat-input-icon" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask about markets, SIPs, taxes, or your portfolio…"
          disabled={disabled}
        />
        <button type="submit" className="chat-send-btn" disabled={disabled || !value.trim()}>
          <SendIcon width={18} height={18} />
        </button>
      </div>
      <p className="chat-disclaimer">Bazar.ai can make mistakes. Consult a financial advisor for personalized investment advice.</p>
    </form>
  )
}
