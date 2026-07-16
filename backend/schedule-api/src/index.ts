import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda'
import * as agents from './routes/agents'
import { handleChat } from './routes/chat'
import { HttpError, fail, ok } from './utils/response'
import { logger } from './utils/logger'

function parseBody(event: APIGatewayProxyEventV2WithJWTAuthorizer): unknown {
  if (!event.body) return null
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf-8') : event.body
  return JSON.parse(raw)
}

function getActor(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const claims = event.requestContext.authorizer.jwt.claims
  return {
    userId: claims.sub as string,
    email: (claims.email as string) || '',
  }
}

export async function handler(
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
): Promise<APIGatewayProxyResultV2> {
  logger.info('Incoming request', { routeKey: event.routeKey })

  if (event.requestContext.http.method === 'OPTIONS') {
    return ok({})
  }

  try {
    const actor = getActor(event)

    switch (event.routeKey) {
      case 'GET /agents':
        return await agents.listAgents(actor)
      case 'POST /agents':
        return await agents.createAgent(actor, parseBody(event))
      case 'GET /agents/{id}':
        return await agents.getAgent(actor, agents.requireAgentId(event.pathParameters ?? null))
      case 'PUT /agents/{id}':
        return await agents.updateAgent(actor, agents.requireAgentId(event.pathParameters ?? null), parseBody(event))
      case 'DELETE /agents/{id}':
        return await agents.deleteAgent(actor, agents.requireAgentId(event.pathParameters ?? null))
      case 'POST /agents/{id}/pause':
        return await agents.setAgentStatus(actor, agents.requireAgentId(event.pathParameters ?? null), 'PAUSED')
      case 'POST /agents/{id}/resume':
        return await agents.setAgentStatus(actor, agents.requireAgentId(event.pathParameters ?? null), 'ACTIVE')
      case 'GET /agents/{id}/history':
        return await agents.getHistory(actor, agents.requireAgentId(event.pathParameters ?? null))
      case 'POST /chat':
        return await handleChat(parseBody(event))
      default:
        return fail(`No route for ${event.routeKey}`, 404)
    }
  } catch (err) {
    if (err instanceof HttpError) {
      return fail(err.message, err.statusCode)
    }

    logger.error('Unhandled error', { error: err instanceof Error ? err.stack : String(err) })
    return fail('Internal server error.', 500)
  }
}
