import {
  SchedulerClient,
  CreateScheduleCommand,
  UpdateScheduleCommand,
  DeleteScheduleCommand,
  GetScheduleCommand,
  FlexibleTimeWindowMode,
  ScheduleState,
} from '@aws-sdk/client-scheduler'
import { logger } from '../utils/logger'
import type { CreateAgentInput } from '../types/agent.types'

const client = new SchedulerClient({ region: process.env.AWS_REGION })

const GROUP_NAME = process.env.SCHEDULER_GROUP_NAME || 'default'
const AGENT_RUNNER_ARN = process.env.AGENT_RUNNER_FUNCTION_ARN as string
const SCHEDULER_ROLE_ARN = process.env.SCHEDULER_ROLE_ARN as string

/**
 * Weekly schedules always fire on Monday and monthly schedules always fire on the
 * 1st — the UI only collects a frequency + time, not a specific weekday/day-of-month.
 * Users who need finer control can pick the "Cron" frequency instead.
 */
export function buildScheduleExpression(input: Pick<CreateAgentInput, 'frequency' | 'time' | 'cronExpression'>): string {
  const [hour, minute] = (input.time || '09:00').split(':')

  switch (input.frequency) {
    case 'Daily':
      return `cron(${minute} ${hour} * * ? *)`
    case 'Weekly':
      return `cron(${minute} ${hour} ? * MON *)`
    case 'Monthly':
      return `cron(${minute} ${hour} 1 * ? *)`
    case 'Cron':
      return `cron(${input.cronExpression})`
    default:
      throw new Error(`Unsupported frequency: ${input.frequency}`)
  }
}

export function scheduleNameFor(agentId: string): string {
  return `agent-${agentId}`
}

interface ScheduleParams {
  agentId: string
  userId: string
  scheduleName: string
  scheduleExpression: string
  timezone: string
  enabled: boolean
}

export async function createSchedule(params: ScheduleParams): Promise<string> {
  const result = await client.send(
    new CreateScheduleCommand({
      Name: params.scheduleName,
      GroupName: GROUP_NAME,
      ScheduleExpression: params.scheduleExpression,
      ScheduleExpressionTimezone: params.timezone,
      State: params.enabled ? ScheduleState.ENABLED : ScheduleState.DISABLED,
      FlexibleTimeWindow: { Mode: FlexibleTimeWindowMode.OFF },
      Target: {
        Arn: AGENT_RUNNER_ARN,
        RoleArn: SCHEDULER_ROLE_ARN,
        Input: JSON.stringify({ agentId: params.agentId, userId: params.userId }),
      },
    }),
  )

  logger.info('Created EventBridge schedule', { scheduleName: params.scheduleName })
  return result.ScheduleArn as string
}

export async function updateSchedule(params: ScheduleParams): Promise<void> {
  const existing = await client.send(
    new GetScheduleCommand({ Name: params.scheduleName, GroupName: GROUP_NAME }),
  )

  await client.send(
    new UpdateScheduleCommand({
      Name: params.scheduleName,
      GroupName: GROUP_NAME,
      ScheduleExpression: params.scheduleExpression,
      ScheduleExpressionTimezone: params.timezone,
      State: params.enabled ? ScheduleState.ENABLED : ScheduleState.DISABLED,
      FlexibleTimeWindow: existing.FlexibleTimeWindow ?? { Mode: FlexibleTimeWindowMode.OFF },
      Target: {
        Arn: AGENT_RUNNER_ARN,
        RoleArn: SCHEDULER_ROLE_ARN,
        Input: JSON.stringify({ agentId: params.agentId, userId: params.userId }),
      },
    }),
  )

  logger.info('Updated EventBridge schedule', { scheduleName: params.scheduleName })
}

export async function setScheduleState(scheduleName: string, enabled: boolean): Promise<void> {
  const existing = await client.send(
    new GetScheduleCommand({ Name: scheduleName, GroupName: GROUP_NAME }),
  )

  if (!existing.ScheduleExpression || !existing.Target) {
    throw new Error(`Schedule ${scheduleName} is missing required fields.`)
  }

  await client.send(
    new UpdateScheduleCommand({
      Name: scheduleName,
      GroupName: GROUP_NAME,
      ScheduleExpression: existing.ScheduleExpression,
      ScheduleExpressionTimezone: existing.ScheduleExpressionTimezone,
      FlexibleTimeWindow: existing.FlexibleTimeWindow ?? { Mode: FlexibleTimeWindowMode.OFF },
      Target: existing.Target,
      State: enabled ? ScheduleState.ENABLED : ScheduleState.DISABLED,
    }),
  )
}

export async function deleteSchedule(scheduleName: string): Promise<void> {
  await client
    .send(new DeleteScheduleCommand({ Name: scheduleName, GroupName: GROUP_NAME }))
    .catch((err) => logger.warn('Schedule delete failed (may already be gone)', { error: String(err) }))
}
