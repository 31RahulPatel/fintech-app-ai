export interface Agent {
  id: string
  userId: string
  name: string
  prompt: string
  frequency: string
  time: string
  timezone: string
  deliveryEmail: string
  status: 'ACTIVE' | 'PAUSED'
  runCount: number
  lastRun: string | null
}

export interface ExecutionHistoryItem {
  agentId: string
  executedAt: string
  status: 'SUCCESS' | 'FAILED'
  summary: string
  emailMessageId?: string
  error?: string
}

export interface BedrockReport {
  summary: string
  analysis: string
  risks: string[]
  opportunities: string[]
  suggestedActions: string[]
}

export interface SchedulerEvent {
  agentId: string
  userId: string
}
