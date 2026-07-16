import { HttpError } from './response'
import type { CreateAgentInput, UpdateAgentInput } from '../types/agent.types'

const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Cron']
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

export function validateCreateAgent(body: unknown): CreateAgentInput {
  if (!body || typeof body !== 'object') {
    throw new HttpError('Request body is required.')
  }

  const input = body as Record<string, unknown>

  if (!input.name || typeof input.name !== 'string' || !input.name.trim()) {
    throw new HttpError('Agent name is required.')
  }

  if (!input.prompt || typeof input.prompt !== 'string' || !input.prompt.trim()) {
    throw new HttpError('Prompt is required.')
  }

  if (typeof input.frequency !== 'string' || !FREQUENCIES.includes(input.frequency)) {
    throw new HttpError(`Frequency must be one of: ${FREQUENCIES.join(', ')}`)
  }

  if (input.frequency === 'Cron') {
    if (typeof input.cronExpression !== 'string' || !input.cronExpression.trim()) {
      throw new HttpError('cronExpression is required when frequency is Cron.')
    }
  } else if (typeof input.time !== 'string' || !TIME_RE.test(input.time)) {
    throw new HttpError('Time must be in HH:mm format.')
  }

  if (typeof input.timezone !== 'string' || !input.timezone.trim()) {
    throw new HttpError('Timezone is required.')
  }

  if (input.delivery !== 'Email') {
    throw new HttpError('Only Email delivery is currently supported.')
  }

  return {
    name: input.name.trim(),
    prompt: input.prompt.trim(),
    frequency: input.frequency as CreateAgentInput['frequency'],
    time: input.time as string | undefined,
    cronExpression: input.cronExpression as string | undefined,
    timezone: input.timezone.trim(),
    delivery: 'Email',
  }
}

export function validateUpdateAgent(body: unknown): UpdateAgentInput {
  if (!body || typeof body !== 'object') {
    throw new HttpError('Request body is required.')
  }

  const input = body as Record<string, unknown>
  const update: UpdateAgentInput = {}

  if (input.name !== undefined) update.name = String(input.name).trim()
  if (input.prompt !== undefined) update.prompt = String(input.prompt).trim()
  if (input.timezone !== undefined) update.timezone = String(input.timezone).trim()

  if (input.frequency !== undefined) {
    if (!FREQUENCIES.includes(input.frequency as string)) {
      throw new HttpError(`Frequency must be one of: ${FREQUENCIES.join(', ')}`)
    }
    update.frequency = input.frequency as UpdateAgentInput['frequency']
  }

  if (input.time !== undefined) update.time = String(input.time)
  if (input.cronExpression !== undefined) update.cronExpression = String(input.cronExpression)

  if (input.status !== undefined) {
    if (input.status !== 'ACTIVE' && input.status !== 'PAUSED') {
      throw new HttpError('status must be ACTIVE or PAUSED.')
    }
    update.status = input.status
  }

  return update
}
