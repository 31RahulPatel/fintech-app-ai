import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { logger } from '../utils/logger'

// Bedrock Nova may not be available in the same region as the rest of the stack
// (e.g. ap-south-1) — BEDROCK_REGION lets the Lambda call it cross-region.
const client = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || process.env.AWS_REGION })
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-lite-v1:0'

const SYSTEM_PROMPT = `You are Bazar.ai, the AI financial assistant inside FintechOps.
Answer concisely and clearly for a retail investor in India.
Cover investments, markets, SIPs, mutual funds, tax planning, and crypto.
Always add a short one-line disclaimer that this is not personalized financial advice.`

/**
 * One-shot Q&A used by the dashboard chat box (distinct from the scheduled report
 * generation in the agent-runner Lambda, which builds a richer prompt with live
 * market data before calling Bedrock).
 */
export async function askBazarAi(message: string): Promise<string> {
  const body = {
    schemaVersion: 'messages-v1',
    system: [{ text: SYSTEM_PROMPT }],
    messages: [{ role: 'user', content: [{ text: message }] }],
    inferenceConfig: { maxTokens: 600, temperature: 0.4, topP: 0.9 },
  }

  const response = await client.send(
    new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body),
    }),
  )

  const payload = JSON.parse(new TextDecoder().decode(response.body))
  const reply = payload?.output?.message?.content?.[0]?.text

  if (!reply) {
    logger.error('Unexpected Bedrock response shape', { payload })
    throw new Error('Bazar.ai did not return a response.')
  }

  return reply
}
