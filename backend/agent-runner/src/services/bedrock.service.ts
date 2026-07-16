import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { logger } from '../utils/logger'
import type { BedrockReport } from '../types/agent.types'
import type { MarketSnapshot } from './marketData'

// Bedrock Nova may not be available in the same region as the rest of the stack
// (e.g. ap-south-1) — BEDROCK_REGION lets the Lambda call it cross-region.
const client = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || process.env.AWS_REGION })
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-lite-v1:0'

const SYSTEM_PROMPT = `You are Bazar.ai, the always-on financial analyst inside FintechOps.
You write factual, concise reports for retail investors in India based only on the data provided.
Never invent prices or news that were not given to you. Respond with strict JSON only, no markdown fences.`

export function buildPrompt(userPrompt: string, market: MarketSnapshot, currentDate: string): string {
  return `USER PROMPT:
${userPrompt}

LATEST FINANCIAL DATA (as of ${market.asOf}):
${market.instruments.map((i) => `- ${i.symbol}: ${i.price} (${i.change >= 0 ? '+' : ''}${i.change}%)`).join('\n')}

RECENT HEADLINES:
${market.headlines.map((h) => `- ${h}`).join('\n')}

CURRENT DATE: ${currentDate}

EXPECTED RESPONSE FORMAT (strict JSON, no markdown, matching this exact shape):
{
  "summary": "2-3 sentence market summary relevant to the user prompt",
  "analysis": "A short paragraph analyzing the data in the context of the user's prompt",
  "risks": ["risk 1", "risk 2"],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "suggestedActions": ["action 1", "action 2"]
}`
}

export async function generateReport(userPrompt: string, market: MarketSnapshot, currentDate: string): Promise<BedrockReport> {
  const prompt = buildPrompt(userPrompt, market, currentDate)

  const body = {
    schemaVersion: 'messages-v1',
    system: [{ text: SYSTEM_PROMPT }],
    messages: [{ role: 'user', content: [{ text: prompt }] }],
    inferenceConfig: { maxTokens: 900, temperature: 0.3, topP: 0.9 },
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
  const text = payload?.output?.message?.content?.[0]?.text

  if (!text) {
    logger.error('Unexpected Bedrock response shape', { payload })
    throw new Error('Bedrock Nova did not return a response.')
  }

  try {
    const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```$/, '')
    return JSON.parse(cleaned) as BedrockReport
  } catch (err) {
    logger.error('Failed to parse Bedrock JSON output', { text, error: String(err) })
    return {
      summary: text.slice(0, 400),
      analysis: text,
      risks: [],
      opportunities: [],
      suggestedActions: [],
    }
  }
}
