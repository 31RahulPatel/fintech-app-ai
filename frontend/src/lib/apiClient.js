import { config } from '../config'

async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new Error(data?.message || `Request failed with status ${res.status}`)
  }

  return data
}

export const api = {
  listAgents: (token) => request('/agents', { token }),
  getAgent: (id, token) => request(`/agents/${id}`, { token }),
  createAgent: (payload, token) => request('/agents', { method: 'POST', body: payload, token }),
  updateAgent: (id, payload, token) =>
    request(`/agents/${id}`, { method: 'PUT', body: payload, token }),
  deleteAgent: (id, token) => request(`/agents/${id}`, { method: 'DELETE', token }),
  toggleAgent: (id, action, token) =>
    request(`/agents/${id}/${action}`, { method: 'POST', token }),
  runAgentNow: (id, token) => request(`/agents/${id}/run`, { method: 'POST', token }),
  getHistory: (id, token) => request(`/agents/${id}/history`, { token }),
  sendChatMessage: (message, token) => request('/chat', { method: 'POST', body: { message }, token }),
}
