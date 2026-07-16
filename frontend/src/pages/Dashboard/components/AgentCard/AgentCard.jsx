import { PlayIcon, PauseIcon, EyeIcon, TrashIcon, MailIcon } from '../../../../components/Icons/Icons'
import './AgentCard.css'

export default function AgentCard({ agent, onView, onToggle, onDelete }) {
  const isActive = agent.status === 'ACTIVE'

  return (
    <div className={`agent-card ${isActive ? 'agent-card-active' : ''}`}>
      <div className="agent-card-header">
        <span className={`agent-status-dot ${isActive ? 'on' : 'off'}`}>
          {isActive ? <PlayIcon width={12} height={12} /> : <PauseIcon width={12} height={12} />}
        </span>
        <span className="agent-name">{agent.name}</span>
      </div>

      <div className="agent-meta">
        <span>{agent.frequency}</span>
        <span className="agent-meta-dot" />
        <span>{agent.time}</span>
        <span className="agent-delivery">
          <MailIcon width={12} height={12} /> {agent.delivery}
        </span>
      </div>

      <div className="agent-stats">
        <div>
          <div className="agent-stat-value">{agent.runCount}</div>
          <div className="agent-stat-label">RUNS</div>
        </div>
        <div>
          <div className="agent-stat-value">{agent.lastRun || '—'}</div>
          <div className="agent-stat-label">LAST RUN</div>
        </div>
      </div>

      <div className="agent-actions">
        <button type="button" onClick={() => onView(agent)} aria-label="View agent">
          <EyeIcon width={16} height={16} />
        </button>
        <button type="button" className="agent-action-primary" onClick={() => onToggle(agent)} aria-label="Toggle agent">
          {isActive ? <PauseIcon width={16} height={16} /> : <PlayIcon width={16} height={16} />}
        </button>
        <button type="button" className="agent-action-danger" onClick={() => onDelete(agent)} aria-label="Delete agent">
          <TrashIcon width={16} height={16} />
        </button>
      </div>
    </div>
  )
}
