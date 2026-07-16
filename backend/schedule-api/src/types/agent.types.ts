export type AgentFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Cron'
export type AgentStatus = 'ACTIVE' | 'PAUSED'
export type DeliveryMethod = 'Email'

export interface Agent {
  id: string
  userId: string
  name: string
  prompt: string
  frequency: AgentFrequency
  time: string
  cronExpression?: string
  timezone: string
  delivery: DeliveryMethod
  deliveryEmail: string
  status: AgentStatus
  scheduleArn: string
  scheduleName: string
  runCount: number
  lastRun: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateAgentInput {
  name: string
  prompt: string
  frequency: AgentFrequency
  time?: string
  cronExpression?: string
  timezone: string
  delivery: DeliveryMethod
}

export interface UpdateAgentInput extends Partial<CreateAgentInput> {
  status?: AgentStatus
}

export interface ExecutionHistoryItem {
  agentId: string
  executedAt: string
  status: 'SUCCESS' | 'FAILED'
  summary: string
  emailMessageId?: string
  error?: string
}
