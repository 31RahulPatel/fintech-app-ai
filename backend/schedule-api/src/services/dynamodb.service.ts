import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb'
import type { Agent, ExecutionHistoryItem } from '../types/agent.types'

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }))

const AGENTS_TABLE = process.env.AGENTS_TABLE as string
const HISTORY_TABLE = process.env.EXECUTION_HISTORY_TABLE as string
const USERS_TABLE = process.env.USERS_TABLE as string

export async function putAgent(agent: Agent): Promise<void> {
  await client.send(new PutCommand({ TableName: AGENTS_TABLE, Item: agent }))
}

export async function getAgent(userId: string, agentId: string): Promise<Agent | null> {
  const result = await client.send(
    new GetCommand({ TableName: AGENTS_TABLE, Key: { userId, id: agentId } }),
  )
  return (result.Item as Agent) ?? null
}

export async function listAgents(userId: string): Promise<Agent[]> {
  const result = await client.send(
    new QueryCommand({
      TableName: AGENTS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      ScanIndexForward: false,
    }),
  )
  return (result.Items as Agent[]) ?? []
}

export async function updateAgentFields(
  userId: string,
  agentId: string,
  fields: Partial<Agent>,
): Promise<Agent> {
  const entries = Object.entries(fields)
  const names: Record<string, string> = {}
  const values: Record<string, unknown> = {}
  const sets = entries.map(([key, value], i) => {
    names[`#f${i}`] = key
    values[`:v${i}`] = value
    return `#f${i} = :v${i}`
  })

  const result = await client.send(
    new UpdateCommand({
      TableName: AGENTS_TABLE,
      Key: { userId, id: agentId },
      UpdateExpression: `SET ${sets.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: 'ALL_NEW',
    }),
  )
  return result.Attributes as Agent
}

export async function deleteAgent(userId: string, agentId: string): Promise<void> {
  await client.send(new DeleteCommand({ TableName: AGENTS_TABLE, Key: { userId, id: agentId } }))
}

export async function hasRequestedEmailVerification(userId: string): Promise<boolean> {
  const result = await client.send(new GetCommand({ TableName: USERS_TABLE, Key: { userId } }))
  return Boolean(result.Item?.emailVerificationRequested)
}

export async function markEmailVerificationRequested(userId: string, email: string): Promise<void> {
  await client.send(
    new PutCommand({
      TableName: USERS_TABLE,
      Item: { userId, email, emailVerificationRequested: true, requestedAt: new Date().toISOString() },
    }),
  )
}

export async function listHistory(agentId: string, limit = 20): Promise<ExecutionHistoryItem[]> {
  const result = await client.send(
    new QueryCommand({
      TableName: HISTORY_TABLE,
      KeyConditionExpression: 'agentId = :agentId',
      ExpressionAttributeValues: { ':agentId': agentId },
      ScanIndexForward: false,
      Limit: limit,
    }),
  )
  return (result.Items as ExecutionHistoryItem[]) ?? []
}
