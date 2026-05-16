import { useEffect, useRef } from 'react'

interface ClientMetricsData {
  browser: string
  os: string
  screen_width: number
  screen_height: number
  device_type: string
  cpu_cores: number | null
  memory_gb: number | null
  connection_type: string | null
  page_url: string
  session_duration: number
}

export function useClientMetrics(apiUrl: string) {
  const startTime = useRef(Date.now())

  const getDeviceType = (): string => {
    const ua = navigator.userAgent
    if (/mobile/i.test(ua)) return 'mobile'
    if (/tablet/i.test(ua)) return 'tablet'
    return 'desktop'
  }

  const getBrowser = (): string => {
    const ua = navigator.userAgent
    if (ua.includes('Chrome')) return 'Chrome'
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Safari')) return 'Safari'
    if (ua.includes('Edge')) return 'Edge'
    return 'Other'
  }

  const getOS = (): string => {
    const ua = navigator.userAgent
    if (ua.includes('Windows')) return 'Windows'
    if (ua.includes('Mac')) return 'macOS'
    if (ua.includes('Linux')) return 'Linux'
    if (ua.includes('Android')) return 'Android'
    if (ua.includes('iOS')) return 'iOS'
    return 'Other'
  }

  const getConnectionType = async (): Promise<string | null> => {
    try {
      // @ts-ignore - navigator.connection is not in TypeScript types
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      return conn?.effectiveType || null
    } catch {
      return null
    }
  }

  const getCPUCores = async (): Promise<number | null> => {
    try {
      // @ts-ignore - hardwareConcurrency is not always available
      return navigator.hardwareConcurrency || null
    } catch {
      return null
    }
  }

  const getMemory = async (): Promise<number | null> => {
    try {
      // @ts-ignore - deviceMemory is not in TypeScript types
      return navigator.deviceMemory || null
    } catch {
      return null
    }
  }

  const collectMetrics = async () => {
    const sessionDuration = Math.floor((Date.now() - startTime.current) / 1000)

    const metrics: ClientMetricsData = {
      browser: getBrowser(),
      os: getOS(),
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      device_type: getDeviceType(),
      cpu_cores: await getCPUCores(),
      memory_gb: await getMemory(),
      connection_type: await getConnectionType(),
      page_url: window.location.pathname,
      session_duration: sessionDuration
    }

    try {
      await fetch(`${apiUrl}/api/client-metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      })
    } catch (error) {
      console.error('Failed to send client metrics:', error)
    }
  }

  useEffect(() => {
    // Collect metrics on page load
    collectMetrics()

    // Re-collect every 30 seconds
    const interval = setInterval(collectMetrics, 30000)

    // Collect on page unload (before user leaves)
    const handleBeforeUnload = () => {
      collectMetrics()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [apiUrl])
}