export interface ClientMetrics {
  browser: string
  os: string
  screenWidth: number
  screenHeight: number
  deviceType: 'desktop' | 'mobile' | 'tablet'
  cpuCores: number | null
  memoryGb: number | null
  connectionType: string | null
  pageUrl: string
  sessionDuration: number
  pageLoadTime: number | null
  batteryLevel: number | null
  batteryCharging: boolean | null
}

export interface ClientMetricsDisplay {
  label: string
  value: string | number | null
  icon: string
  color: string
}