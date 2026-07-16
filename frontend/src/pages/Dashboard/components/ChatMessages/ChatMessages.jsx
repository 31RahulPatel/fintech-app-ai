import Spinner from '../../../../components/Spinner/Spinner'
import './ChatMessages.css'

export default function ChatMessages({ messages, pending }) {
  return (
    <div className="chat-messages">
      {messages.map((m) => (
        <div key={m.id} className={`chat-bubble chat-bubble-${m.role}`}>
          {m.content}
        </div>
      ))}
      {pending && (
        <div className="chat-bubble chat-bubble-assistant chat-bubble-pending">
          <Spinner size={16} /> Thinking…
        </div>
      )}
    </div>
  )
}
