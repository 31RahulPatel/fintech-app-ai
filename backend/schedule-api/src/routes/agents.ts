import { randomUUID } from 'crypto'
import * as db from '../services/dynamodb.service'
import * as scheduler from '../services/eventbridge.service'
import * as ses from '../services/ses.service'
import { validateCreateAgent, validateUpdateAgent } from '../utils/validation'
import { HttpError, ok, fail } from '../utils/response'
import { logger } from '../utils/logger'
import type { APIGatewayProxyResultV2 } from 'aws-lambda'
import type { Agent } from '../types/agent.types'

interface Actor {
  userId: string
  email: string
}

export async function listAgents(actor: Actor): Promise<APIGatewayProxyResultV2> {
  const agents = await db.listAgents(actor.userId)
  return ok({ agents })
}

export async function getAgent(actor: Actor, agentId: string): Promise<APIGatewayProxyResultV2> {
  const agent = await db.getAgent(actor.userId, agentId)
  if (!agent) return fail('Agent not found.', 404)
  return ok({ agent })
}

export async function createAgent(actor: Actor, body: unknown): Promise<APIGatewayProxyResultV2> {
  const input = validateCreateAgent(body)
  const id = randomUUID()
  const now = new Date().toISOString()
  const scheduleName = scheduler.scheduleNameFor(id)
  const scheduleExpression = scheduler.buildScheduleExpression(input)

  const scheduleArn = await scheduler.createSchedule({
    agentId: id,
    userId: actor.userId,
    scheduleName,
    scheduleExpression,
    timezone: input.timezone,
    enabled: true,
  })

  const agent: Agent = {
    id,
    userId: actor.userId,
    name: input.name,
    prompt: input.prompt,
    frequency: input.frequency,
    time: input.time || '',
    cronExpression: input.cronExpression,
    timezone: input.timezone,
    delivery: input.delivery,
    deliveryEmail: actor.email,
    status: 'ACTIVE',
    scheduleArn,
    scheduleName,
    runCount: 0,
    lastRun: null,
    createdAt: now,
    updatedAt: now,
  }

  await db.putAgent(agent)
  logger.info('Agent created', { agentId: id, userId: actor.userId })

  // While SES is in sandbox mode, this is what lets any user actually receive their
  // reports: it triggers AWS's own "click to confirm this address" email the first
  // time each user creates an agent, rather than requiring manual console verification.
  let emailVerificationRequested = false
  const alreadyRequested = await db.hasRequestedEmailVerification(actor.userId).catch(() => true)
  if (!alreadyRequested) {
    await ses.requestEmailVerification(actor.email).catch((err) =>
      logger.warn('SES verification request failed', { userId: actor.userId, error: String(err) }),
    )
    await db.markEmailVerificationRequested(actor.userId, actor.email).catch((err) =>
      logger.warn('Failed to record verification request', { userId: actor.userId, error: String(err) }),
    )
    emailVerificationRequested = true
  }

  return ok({ agent, emailVerificationRequested }, 201)
}

export async function updateAgent(actor: Actor, agentId: string, body: unknown): Promise<APIGatewayProxyResultV2> {
  const existing = await db.getAgent(actor.userId, agentId)
  if (!existing) return fail('Agent not found.', 404)

  const input = validateUpdateAgent(body)
  const merged: Agent = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  } as Agent

  const scheduleExpression = scheduler.buildScheduleExpression(merged)
  await scheduler.updateSchedule({
    agentId,
    userId: actor.userId,
    scheduleName: existing.scheduleName,
    scheduleExpression,
    timezone: merged.timezone,
    enabled: merged.status === 'ACTIVE',
  })

  const agent = await db.updateAgentFields(actor.userId, agentId, {
    ...input,
    updatedAt: merged.updatedAt,
  })

  return ok({ agent })
}

export async function setAgentStatus(actor: Actor, agentId: string, status: 'ACTIVE' | 'PAUSED'): Promise<APIGatewayProxyResultV2> {
  const existing = await db.getAgent(actor.userId, agentId)
  if (!existing) return fail('Agent not found.', 404)

  await scheduler.setScheduleState(existing.scheduleName, status === 'ACTIVE')
  const agent = await db.updateAgentFields(actor.userId, agentId, {
    status,
    updatedAt: new Date().toISOString(),
  })

  return ok({ agent })
}

export async function deleteAgent(actor: Actor, agentId: string): Promise<APIGatewayProxyResultV2> {
  const existing = await db.getAgent(actor.userId, agentId)
  if (!existing) return fail('Agent not found.', 404)

  await scheduler.deleteSchedule(existing.scheduleName)
  await db.deleteAgent(actor.userId, agentId)
  logger.info('Agent deleted', { agentId, userId: actor.userId })
  return ok({ deleted: true })
}

export async function getHistory(actor: Actor, agentId: string): Promise<APIGatewayProxyResultV2> {
  const agent = await db.getAgent(actor.userId, agentId)
  if (!agent) return fail('Agent not found.', 404)

  const history = await db.listHistory(agentId)
  return ok({ history })
}

export function requireAgentId(pathParams: Record<string, string | undefined> | null): string {
  const id = pathParams?.id
  if (!id) throw new HttpError('Agent id is required in the path.', 400)
  return id
}
