import * as db from './services/dynamodb.service'
import { getMarketDataProvider } from './services/marketData'
import { generateReport } from './services/bedrock.service'
import { buildReportEmail } from './templates/email.template'
import { sendReportEmail } from './services/ses.service'
import { logger } from './utils/logger'
import type { SchedulerEvent } from './types/agent.types'

export async function handler(event: SchedulerEvent): Promise<void> {
  const { agentId, userId } = event
  logger.info('Agent runner triggered', { agentId, userId })

  const agent = await db.getAgent(userId, agentId)

  if (!agent) {
    logger.warn('Agent not found — schedule may be stale', { agentId, userId })
    return
  }

  if (agent.status !== 'ACTIVE') {
    logger.info('Agent is paused, skipping run', { agentId })
    return
  }

  const executedAt = new Date().toISOString()

  try {
    const market = await getMarketDataProvider().getSnapshot()
    const currentDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })

    const report = await generateReport(agent.prompt, market, currentDate)
    const { subject, html } = buildReportEmail(agent.name, report, market, currentDate)
    const messageId = await sendReportEmail(agent.deliveryEmail, subject, html)

    await db.recordRun(userId, agentId, executedAt)
    await db.putHistory({
      agentId,
      executedAt,
      status: 'SUCCESS',
      summary: report.summary,
      emailMessageId: messageId,
    })

    logger.info('Agent run completed', { agentId, messageId })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('Agent run failed', { agentId, error: message })

    await db.putHistory({
      agentId,
      executedAt,
      status: 'FAILED',
      summary: 'Run failed before a report could be generated.',
      error: message,
    })

    throw err
  }
}
