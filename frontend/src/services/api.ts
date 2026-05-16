import type { Metrics, MetricsHistory, LogEntry, LogAnalysis, Alert, Settings, SystemInfo, ChatResponse } from '@/types'

const API_BASE = '/api'

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export const metricsApi = {
  getMetrics: () => fetchJson<Metrics>('/metrics'),
  getHistory: () => fetchJson<MetricsHistory>('/metrics/history'),
}

export const logsApi = {
  uploadLogs: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(`${API_BASE}/logs/upload`, {
      method: 'POST',
      body: formData,
    })
    return response.json()
  },
  getLogs: (params?: { level?: string; source?: string; search?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.level) searchParams.set('level', params.level)
    if (params?.source) searchParams.set('source', params.source)
    if (params?.search) searchParams.set('search', params.search)
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.offset) searchParams.set('offset', String(params.offset))
    return fetchJson<{ logs: LogEntry[]; total: number; limit: number; offset: number }>(`/logs?${searchParams}`)
  },
  analyzeLogs: (logs: string[]) =>
    fetchJson<LogAnalysis>('/logs/analyze', {
      method: 'POST',
      body: JSON.stringify({ logs }),
    }),
}

export const alertsApi = {
  getAlerts: (activeOnly = true) =>
    fetchJson<Alert[]>(`/alerts?active_only=${activeOnly}`),
  acknowledgeAlert: (alertId: number) =>
    fetchJson<{ message: string }>(`/alerts/${alertId}/acknowledge`, { method: 'POST' }),
  resolveAlert: (alertId: number) =>
    fetchJson<{ message: string }>(`/alerts/${alertId}/resolve`, { method: 'POST' }),
}

export const systemApi = {
  getSystemInfo: () => fetchJson<SystemInfo>('/system'),
}

export const settingsApi = {
  getSettings: () => fetchJson<Settings>('/settings'),
  updateSettings: (settings: Partial<Settings>) =>
    fetchJson<Settings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
}

export const chatApi = {
  sendMessage: (message: string, context?: Record<string, unknown>) =>
    fetchJson<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    }),
}