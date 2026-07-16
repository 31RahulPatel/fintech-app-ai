import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import SuggestedPrompts from './components/SuggestedPrompts/SuggestedPrompts'
import ChatMessages from './components/ChatMessages/ChatMessages'
import ChatInput from './components/ChatInput/ChatInput'
import ScheduleSidebar from './components/ScheduleSidebar/ScheduleSidebar'
import CreateAgentModal from './components/CreateAgentModal/CreateAgentModal'
import { BoltIcon } from '../../components/Icons/Icons'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/apiClient'
import './Dashboard.css'

const DEMO_AGENTS = [
  { id: 'demo-1', name: 'Nifty 50 shares', frequency: 'Daily', time: '9:00 PM', delivery: 'Email', runCount: 1, lastRun: '30/03/2026', status: 'ACTIVE' },
  { id: 'demo-2', name: 'Nifty 50 top shares in table', frequency: 'Daily', time: '4:45 PM', delivery: 'Email', runCount: 1, lastRun: '30/03/2026', status: 'ACTIVE' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [pending, setPending] = useState(false)
  const [agents, setAgents] = useState([])
  const [agentsLoading, setAgentsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [verificationBanner, setVerificationBanner] = useState(false)

  useEffect(() => {
    let mounted = true
    api
      .listAgents(user?.idToken)
      .then((data) => mounted && setAgents(data?.agents || []))
      .catch(() => mounted && setAgents(DEMO_AGENTS))
      .finally(() => mounted && setAgentsLoading(false))
    return () => {
      mounted = false
    }
  }, [user])

  const sendMessage = async (text) => {
    setMessages((prev) => [...prev, { id: prev.length, role: 'user', content: text }])
    setPending(true)
    try {
      const { reply } = await api.sendChatMessage(text, user?.idToken)
      setMessages((prev) => [...prev, { id: prev.length, role: 'assistant', content: reply }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: prev.length, role: 'assistant', content: `Sorry, Bazar.ai couldn't respond right now (${err.message}).` },
      ])
    } finally {
      setPending(false)
    }
  }

  const handleCreateAgent = async (form) => {
    setCreating(true)
    try {
      const created = await api.createAgent(form, user?.idToken)
      setAgents((prev) => [created.agent, ...prev])
      setModalOpen(false)
      if (created.emailVerificationRequested) setVerificationBanner(true)
    } finally {
      setCreating(false)
    }
  }

  const handleToggle = async (agent) => {
    const action = agent.status === 'ACTIVE' ? 'pause' : 'resume'
    setAgents((prev) => prev.map((a) => (a.id === agent.id ? { ...a, status: action === 'pause' ? 'PAUSED' : 'ACTIVE' } : a)))
    await api.toggleAgent(agent.id, action, user?.idToken).catch(() => {})
  }

  const handleDelete = async (agent) => {
    setAgents((prev) => prev.filter((a) => a.id !== agent.id))
    await api.deleteAgent(agent.id, user?.idToken).catch(() => {})
  }

  const handleView = (agent) => {
    console.info('View agent execution history:', agent.id)
  }

  return (
    <div className="dashboard">
      <Navbar />
      {verificationBanner && (
        <div className="dashboard-verify-banner">
          <span>
            We've sent a confirmation link to <strong>{user?.email}</strong> — click it so your scheduled reports
            can actually be delivered (required while this app's email sending is in AWS SES sandbox mode).
          </span>
          <button type="button" onClick={() => setVerificationBanner(false)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
      <div className="dashboard-body">
        <main className="dashboard-main">
          {messages.length === 0 ? (
            <div className="dashboard-welcome">
              <span className="dashboard-welcome-icon">
                <BoltIcon width={30} height={30} stroke="#fff" />
              </span>
              <h1>Welcome to Bazar.ai</h1>
              <p>Your AI-powered financial assistant. Ask me anything about investments, market analysis, tax planning, or financial strategies.</p>
              <SuggestedPrompts onSelect={sendMessage} />
            </div>
          ) : (
            <ChatMessages messages={messages} pending={pending} />
          )}

          <ChatInput onSend={sendMessage} disabled={pending} />
        </main>

        <ScheduleSidebar
          agents={agents}
          loading={agentsLoading}
          onCreate={() => setModalOpen(true)}
          onView={handleView}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      </div>

      {modalOpen && (
        <CreateAgentModal onClose={() => setModalOpen(false)} onSubmit={handleCreateAgent} submitting={creating} />
      )}
    </div>
  )
}
