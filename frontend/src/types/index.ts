export interface Metrics {
  cpu_percent: number
  memory_percent: number
  disk_percent: number
  memory_total: number
  memory_used: number
  memory_available: number
  disk_total: number
  disk_used: number
  disk_free: number
  timestamp: string
  uptime: string
  hostname: string
}

export interface MetricsHistory {
  timestamps: string[]
  cpu_percent: number[]
  memory_percent: number[]
  disk_percent: number[]
}

export interface LogEntry {
  id: number
  timestamp: string
  level: string
  source: string
  message: string
  raw_content?: string
}

export interface LogAnalysis {
  summary: string
  issues: string[]
  severity_breakdown: Record<string, number>
  root_causes: string[]
  recommendations: string[]
}

export interface Alert {
  id: number
  timestamp: string
  severity: string
  title: string
  message: string
  metric_name?: string
  metric_value?: number
  threshold?: number
  is_active: boolean
  is_acknowledged: boolean
  is_resolved: boolean
}

export interface Settings {
  theme: string
  refresh_interval: number
  cpu_threshold: number
  ram_threshold: number
  disk_threshold: number
  ai_provider: string
  api_key: string
  model: string
  collector_enabled: boolean
  collector_directory: string
  collector_interval: number
}

export interface SystemInfo {
  os: {
    system: string
    release: string
    version: string
    machine: string
    processor: string
  }
  hostname: string
  uptime: string
  cpu: {
    physical_cores: number
    logical_cores: number
    max_frequency: string
    current_frequency: string
  }
  memory: {
    total: number
    available: number
    used: number
    percent: number
  }
  disk: {
    total: number
    used: number
    free: number
    percent: number
  }
  gpu: Array<{ name: string; memory_total: number }>
  network: Array<{ name: string; ip: string; netmask: string }>
  top_processes: Array<{ pid: number; name: string; cpu: number }>
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  response: string
  context_used: string[]
}