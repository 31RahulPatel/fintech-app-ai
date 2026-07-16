import Button from '../../../../components/Button/Button'
import Spinner from '../../../../components/Spinner/Spinner'
import AgentCard from '../AgentCard/AgentCard'
import { PlusIcon } from '../../../../components/Icons/Icons'
import './ScheduleSidebar.css'

export default function ScheduleSidebar({ agents, loading, onCreate, onView, onToggle, onDelete }) {
  return (
    <aside className="schedule-sidebar">
      <Button className="btn-block" onClick={onCreate}>
        <PlusIcon width={16} height={16} /> Create New Schedule
      </Button>

      <div className="schedule-list">
        {loading && (
          <div className="schedule-empty">
            <Spinner size={24} />
          </div>
        )}

        {!loading && agents.length === 0 && (
          <div className="schedule-empty">
            <p>No scheduled agents yet.</p>
            <span>Create one to get always-on financial reports delivered to your inbox.</span>
          </div>
        )}

        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} onView={onView} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </div>
    </aside>
  )
}
