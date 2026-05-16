import { useEffect, useRef, useState } from 'react'

export interface ClientMetricsData {
  browser: string
  os: string
  screenWidth: number
  screenHeight: number
  deviceType: string
  cpuCores: number | null
  memoryGb: number | null
  connectionType: string | null
  pageUrl: string
  sessionDuration: number
  pageLoadTime: number | null
  batteryLevel: number | null
  batteryCharging: boolean | null
}

const defaultMetrics: ClientMetricsData = {
  browser: 'Detecting...',
  os: 'Detecting...',
  screenWidth: 0,
  screenHeight: 0,
  deviceType: 'desktop',
  cpuCores: null,
  memoryGb: null,
  connectionType: null,
  pageUrl: '/',
  sessionDuration: 0,
  pageLoadTime: null,
  batteryLevel: null,
  batteryCharging: null
}

export function useClientMetrics(apiUrl?: string) {
  const [metrics, setMetrics] = useState<ClientMetricsData>(defaultMetrics)
  const [loading, setLoading] = useState(true)
  const startTime = useRef(Date.now())
  const pageStartTime = useRef(performance.now())

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
    if (ua.includes('OPR')) return 'Opera'
    return 'Other'
  }

  const getOS = (): string => {
    const ua = navigator.userAgent
    if (ua.includes('Windows 11')) return 'Windows 11'
    if (ua.includes('Windows')) return 'Windows'
    if (ua.includes('Mac OS X')) return 'macOS'
    if (ua.includes('Mac')) return 'macOS'
    if (ua.includes('Linux')) return 'Linux'
    if (ua.includes('Android')) return 'Android'
    if (ua.includes('iPhone')) return 'iOS'
    if (ua.includes('iPad')) return 'iOS'
    return 'Other'
  }

  const getConnectionType = (): string | null => {
    try {
      // @ts-ignore - navigator.connection is not in TypeScript types
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      return conn?.effectiveType || null
    } catch {
      return null
    }
  }

  const getBatteryInfo = async () => {
    try {
      // @ts-ignore - Battery API is not in TypeScript types
      if (navigator.getBattery) {
        const battery = await navigator.getBattery()
        return {
          level: Math.round(battery.level * 100),
          charging: battery.charging
        }
      }
    } catch {
      // Battery API not supported
    }
    return { level: null, charging: null }
  }

  const collectMetrics = async () => {
    const sessionDuration = Math.floor((Date.now() - startTime.current) / 1000)
    const pageLoadTime = Math.round(performance.now() - pageStartTime.current)
    const batteryInfo = await getBatteryInfo()

    const newMetrics: ClientMetricsData = {
      browser: getBrowser(),
      os: getOS(),
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      deviceType: getDeviceType(),
      cpuCores: navigator.hardwareConcurrency || null,
      memoryGb: (navigator as any).deviceMemory || null,
      connectionType: getConnectionType(),
      pageUrl: window.location.pathname,
      sessionDuration,
      pageLoadTime,
      batteryLevel: batteryInfo.level,
      batteryCharging: batteryInfo.charging
    }

    setMetrics(newMetrics)
    setLoading(false)

    // Send to backend if URL provided
    if (apiUrl) {
      try {
        await fetch(`${apiUrl}/api/client-metrics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            browser: newMetrics.browser,
            os: newMetrics.os,
            screen_width: newMetrics.screenWidth,
            screen_height: newMetrics.screenHeight,
            device_type: newMetrics.deviceType,
            cpu_cores: newMetrics.cpuCores,
            memory_gb: newMetrics.memoryGb,
            connection_type: newMetrics.connectionType,
            page_url: newMetrics.pageUrl,
            session_duration: newMetrics.sessionDuration
          })
        })
      } catch (error) {
        console.error('Failed to send client metrics:', error)
      }
    }
  }

  useEffect(() => {
    // Collect metrics on page load
    collectMetrics()

    // Re-collect every 30 seconds
    const interval = setInterval(collectMetrics, 30000)

    // Collect on page unload
    const handleBeforeUnload = () => {
      collectMetrics()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [apiUrl])

  return { metrics, loading }
}