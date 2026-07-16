import { askBazarAi } from '../services/bedrock.service'
import { HttpError, ok } from '../utils/response'
import type { APIGatewayProxyResultV2 } from 'aws-lambda'

export async function handleChat(body: unknown): Promise<APIGatewayProxyResultV2> {
  const message = (body as Record<string, unknown> | null)?.message

  if (typeof message !== 'string' || !message.trim()) {
    throw new HttpError('message is required.')
  }

  const reply = await askBazarAi(message.trim())
  return ok({ reply })
}
