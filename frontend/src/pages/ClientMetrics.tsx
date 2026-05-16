import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Smartphone, Tablet, Globe, Cpu, HardDrive, Wifi, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { clientMetricsApi } from '@/services/api'

interface ClientMetric {
  id: number
  timestamp: string
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

export default function ClientMetrics() {
  const [metrics, setMetrics] = useState<ClientMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const data = await clientMetricsApi.getClientMetrics()
      setMetrics(data)
    } catch (error) {
      console.error('Failed to load client metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-5 h-5" />
      case 'tablet': return <Tablet className="w-5 h-5" />
      default: return <Monitor className="w-5 h-5" />
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  // Get latest metric for current device (most recent)
  const latestMetric = metrics[0]

  // Calculate stats
  const deviceStats = {
    total: metrics.length,
    desktop: metrics.filter(m => m.device_type === 'desktop').length,
    mobile: metrics.filter(m => m.device_type === 'mobile').length,
    tablet: metrics.filter(m => m.device_type === 'tablet').length,
    avgSession: metrics.length > 0
      ? Math.round(metrics.reduce((acc, m) => acc + m.session_duration, 0) / metrics.length)
      : 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Client Devices</h1>
        <p className="text-slate-400 text-sm">Your current device metrics and browser info</p>
      </div>

      {/* Current Device Stats */}
      {latestMetric && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border-accent-primary/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-primary/20 rounded-lg">
                  {getDeviceIcon(latestMetric.device_type)}
                </div>
                <div>
                  <p className="text-xs text-slate-400">Device Type</p>
                  <p className="text-lg font-semibold text-slate-100 capitalize">{latestMetric.device_type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Browser</p>
                  <p className="text-lg font-semibold text-slate-100">{latestMetric.browser}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Monitor className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Screen</p>
                  <p className="text-lg font-semibold text-slate-100">{latestMetric.screen_width} × {latestMetric.screen_height}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Session Time</p>
                  <p className="text-lg font-semibold text-slate-100">{formatDuration(latestMetric.session_duration)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hardware Details */}
      {latestMetric && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Operating System</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-slate-100">{latestMetric.os}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">CPU Cores</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <p className="text-xl font-semibold text-slate-100">{latestMetric.cpu_cores || 'N/A'}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Memory (RAM)</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-cyan-400" />
              <p className="text-xl font-semibold text-slate-100">{latestMetric.memory_gb ? `${latestMetric.memory_gb} GB` : 'N/A'}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Connection Info */}
      {latestMetric && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Network Connection</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-emerald-400" />
              <p className="text-xl font-semibold text-slate-100">{latestMetric.connection_type || 'Unknown'}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Current Page</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-slate-100">{latestMetric.page_url || '/'}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Table */}
      <Card className="bg-slate-800/50">
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : metrics.length === 0 ? (
            <p className="text-slate-400">No metrics recorded yet. Browse the dashboard to collect data.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-2 text-slate-400">Time</th>
                    <th className="text-left py-3 px-2 text-slate-400">Device</th>
                    <th className="text-left py-3 px-2 text-slate-400">Browser</th>
                    <th className="text-left py-3 px-2 text-slate-400">OS</th>
                    <th className="text-left py-3 px-2 text-slate-400">Screen</th>
                    <th className="text-left py-3 px-2 text-slate-400">Duration</th>
                    <th className="text-left py-3 px-2 text-slate-400">Page</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.slice(0, 10).map((metric, i) => (
                    <motion.tr
                      key={metric.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30"
                    >
                      <td className="py-3 px-2 text-slate-300">{formatDate(metric.timestamp)}</td>
                      <td className="py-3 px-2">
                        <span className="flex items-center gap-1 text-slate-300 capitalize">
                          {getDeviceIcon(metric.device_type)}
                          {metric.device_type}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-300">{metric.browser}</td>
                      <td className="py-3 px-2 text-slate-300">{metric.os}</td>
                      <td className="py-3 px-2 text-slate-300">{metric.screen_width}×{metric.screen_height}</td>
                      <td className="py-3 px-2 text-slate-300">{formatDuration(metric.session_duration)}</td>
                      <td className="py-3 px-2 text-slate-300">{metric.page_url}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}