import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import type { Agent, ExecutionHistoryItem } from '../types/agent.types'

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }))

const AGENTS_TABLE = process.env.AGENTS_TABLE as string
const HISTORY_TABLE = process.env.EXECUTION_HISTORY_TABLE as string

export async function getAgent(userId: string, agentId: string): Promise<Agent | null> {
  const result = await client.send(new GetCommand({ TableName: AGENTS_TABLE, Key: { userId, id: agentId } }))
  return (result.Item as Agent) ?? null
}

export async function recordRun(userId: string, agentId: string, runAt: string): Promise<void> {
  await client.send(
    new UpdateCommand({
      TableName: AGENTS_TABLE,
      Key: { userId, id: agentId },
      UpdateExpression: 'SET lastRun = :runAt, updatedAt = :runAt ADD runCount :one',
      ExpressionAttributeValues: { ':runAt': runAt, ':one': 1 },
    }),
  )
}

export async function putHistory(item: ExecutionHistoryItem): Promise<void> {
  await client.send(new PutCommand({ TableName: HISTORY_TABLE, Item: item }))
}
