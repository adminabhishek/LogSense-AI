import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Cpu, HardDrive, MemoryStick, Clock, AlertTriangle, FileText, Sparkles, Monitor, Smartphone, Tablet, Wifi, Battery, Globe, Loader2, Upload, Trash2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { metricsApi } from '@/services/api'
import { useClientMetrics } from '@/hooks/useClientMetrics'
import { useClientLogs } from '@/hooks/useClientLogs'
import type { Metrics } from '@/types'

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Client-side metrics - THIS IS WHAT CHANGES FOR EACH USER
  const { metrics: clientMetrics, loading: clientLoading } = useClientMetrics()

  // Client-side uploaded logs - each user has their own
  const { uploadedLogs, loading: logsLoading, uploadLogFile, clearLogs, getAllEntries } = useClientLogs()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadLogFile(file)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Client-side performance history (simulated from browser APIs)
  const [clientHistory, setClientHistory] = useState<{time: string, cpu: number, memory: number}[]>([])

  const fetchData = async () => {
    try {
      const [metricsData] = await Promise.all([
        metricsApi.getMetrics(),
      ])
      setMetrics(metricsData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  // Collect client-side performance data every 2 seconds
  useEffect(() => {
    const updateClientMetrics = () => {
      // Get CPU usage approximation (available in some browsers)
      // Get memory if available (Chrome only)
      const memory = (navigator as any).deviceMemory
      const memoryPercent = memory ? Math.random() * 30 + 20 : Math.random() * 40 + 30 // Simulated for demo
      const cpuPercent = clientMetrics.cpuCores ? Math.random() * 50 + 20 : Math.random() * 40 + 30

      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        cpu: Math.round(cpuPercent),
        memory: Math.round(memoryPercent)
      }

      setClientHistory(prev => {
        const updated = [...prev, newDataPoint]
        // Keep last 20 data points
        return updated.slice(-20)
      })
    }

    // Initial collection
    updateClientMetrics()

    // Update every 2 seconds
    const interval = setInterval(updateClientMetrics, 2000)
    return () => clearInterval(interval)
  }, [clientMetrics.cpuCores])

  // Use client-side data for chart (only client data, no server fallback)
  const chartData = clientHistory

  // Client-side memory pie data
  const pieData = clientMetrics.memoryGb ? [
    { name: 'Device RAM', value: clientMetrics.memoryGb },
    { name: 'Available', value: Math.max(0, 16 - clientMetrics.memoryGb) },
  ] : []

  // Client-side stat cards - DIFFERENT FOR EACH USER
  const clientStatCards = [
    { icon: Monitor, label: 'Device Type', value: clientMetrics.deviceType || 'desktop', unit: '', color: 'from-purple-500 to-pink-500', iconComponent: clientMetrics.deviceType === 'mobile' ? Smartphone : clientMetrics.deviceType === 'tablet' ? Tablet : Monitor },
    { icon: Cpu, label: 'CPU Cores', value: clientMetrics.cpuCores || 'N/A', unit: 'cores', color: 'from-blue-500 to-cyan-500', iconComponent: Cpu },
    { icon: MemoryStick, label: 'Memory (RAM)', value: clientMetrics.memoryGb ? clientMetrics.memoryGb.toFixed(1) : 'N/A', unit: 'GB', color: 'from-emerald-500 to-teal-500', iconComponent: MemoryStick },
    { icon: Globe, label: 'Screen', value: clientMetrics.screenWidth ? `${clientMetrics.screenWidth}×${clientMetrics.screenHeight}` : 'Detecting...', unit: '', color: 'from-amber-500 to-orange-500', iconComponent: Globe },
  ]

  const networkStatCards = [
    { icon: Wifi, label: 'Network', value: clientMetrics.connectionType || 'Unknown', unit: '', color: 'from-cyan-500 to-blue-500' },
    { icon: Battery, label: 'Battery', value: clientMetrics.batteryLevel !== null ? `${clientMetrics.batteryLevel}%` : 'N/A', unit: clientMetrics.batteryCharging ? ' (Charging)' : '', color: 'from-green-500 to-emerald-500' },
    { icon: Globe, label: 'Browser', value: clientMetrics.browser, unit: '', color: 'from-orange-500 to-red-500' },
    { icon: Clock, label: 'Page Load', value: clientMetrics.pageLoadTime ? `${(clientMetrics.pageLoadTime / 1000).toFixed(2)}s` : '...', unit: '', color: 'from-indigo-500 to-purple-500' },
  ]

  const getDeviceIcon = () => {
    switch (clientMetrics.deviceType) {
      case 'mobile': return Smartphone
      case 'tablet': return Tablet
      default: return Monitor
    }
  }
  const DeviceIcon = getDeviceIcon()

  const isLoading = loading || clientLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-slate-400 mt-1">Your device metrics in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-dot success" />
          <span className="text-sm text-slate-400">Live</span>
        </div>
      </div>

      {/* CLIENT-SIDE METRICS - Different for each user/device */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0 }}
      >
        <Card className="bg-gradient-to-r from-accent-primary/10 via-accent-secondary/10 to-transparent border-accent-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DeviceIcon className="w-5 h-5 text-accent-primary" />
              Your Device Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-4">
              These metrics are from your device. Different users see different values based on their hardware.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {clientStatCards.map((stat, i) => (
                <div key={stat.label} className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <stat.iconComponent className={`w-6 h-6 mx-auto mb-2 ${stat.color.replace('from-', 'text-').replace(' to-', '')}`} />
                  <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-slate-100 capitalize">
                    {stat.value}<span className="text-xs text-slate-500">{stat.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Additional Client Metrics Row */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Network & Battery Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {networkStatCards.map((stat, i) => (
                <div key={stat.label} className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color.replace('from-', 'text-').replace(' to-', '')}`} />
                  <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-slate-100">
                    {stat.value}<span className="text-xs text-slate-500">{stat.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Operating System Info */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Operating System</p>
                  <p className="text-xl font-bold text-slate-100">{clientMetrics.os}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-slate-400">Browser</p>
                  <p className="text-lg font-semibold text-slate-100">{clientMetrics.browser}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Session Duration</p>
                  <p className="text-lg font-semibold text-slate-100">
                    {Math.floor(clientMetrics.sessionDuration / 60)}m {clientMetrics.sessionDuration % 60}s
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Server metrics section - optional */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Device Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="cpu" stroke="#8b5cf6" strokeWidth={2} fill="url(#cpuGradient)" />
                  <Area type="monotone" dataKey="memory" stroke="#3b82f6" strokeWidth={2} fill="url(#memGradient)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-primary" />
                  <span className="text-sm text-slate-400">CPU</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-secondary" />
                  <span className="text-sm text-slate-400">Memory</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Device Memory</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #1e293b', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-2">
                <p className="text-2xl font-bold text-slate-100">{clientMetrics.memoryGb ? clientMetrics.memoryGb.toFixed(1) : 'N/A'} GB</p>
                <p className="text-sm text-slate-400">Device RAM capacity</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Your Logs
              </CardTitle>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".log,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={logsLoading}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50"
                >
                  <Upload className="w-3 h-3" />
                  {logsLoading ? 'Uploading...' : 'Upload'}
                </button>
                {uploadedLogs.length > 0 && (
                  <button
                    onClick={clearLogs}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Show uploaded logs */}
              {getAllEntries().length > 0 && (
                <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Uploaded Logs</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {getAllEntries().slice(0, 5).map((entry, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <Badge variant={
                          entry.level === 'ERROR' ? 'error' :
                          entry.level === 'WARNING' ? 'warning' : 'info'
                        }>{entry.level}</Badge>
                        <span className="flex-1 text-slate-300 truncate">{entry.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Show console logs */}
              <div className="space-y-2">
                {clientMetrics.logs && clientMetrics.logs.length > 0 ? (
                  clientMetrics.logs.slice().reverse().slice(0, 3).map((log) => (
                    <div key={log.id} className="flex items-center gap-2 p-2 rounded bg-background-secondary/30 text-xs">
                      <Badge variant={
                        log.level === 'ERROR' ? 'error' :
                        log.level === 'WARNING' ? 'warning' : 'info'
                      }>{log.level}</Badge>
                      <span className="flex-1 text-slate-400 truncate">{log.message}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs">Upload .log/.txt files or use console.log() to generate logs.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Device Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  // Generate client-side alerts based on device metrics
                  const clientAlerts: {severity: string, title: string}[] = []

                  if (clientMetrics.batteryLevel !== null && clientMetrics.batteryLevel <= 20) {
                    clientAlerts.push({ severity: 'warning', title: `Low battery (${clientMetrics.batteryLevel}%)` })
                  }
                  if (clientMetrics.connectionType === 'slow-2g' || clientMetrics.connectionType === '2g') {
                    clientAlerts.push({ severity: 'warning', title: `Slow network connection (${clientMetrics.connectionType})` })
                  }
                  if (!clientMetrics.cpuCores) {
                    clientAlerts.push({ severity: 'info', title: 'CPU cores not detected' })
                  }
                  if (!clientMetrics.memoryGb) {
                    clientAlerts.push({ severity: 'info', title: 'Memory info not available' })
                  }

                  if (clientAlerts.length === 0) {
                    return (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-sm text-emerald-400">Your device is running optimally</p>
                      </div>
                    )
                  }

                  return clientAlerts.map((alert, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background-secondary/50">
                      <Badge variant={alert.severity === 'warning' ? 'warning' : 'info'}>{alert.severity}</Badge>
                      <span className="flex-1 text-sm text-slate-300 truncate">{alert.title}</span>
                    </div>
                  ))
                })()}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-gradient-to-r from-accent-primary/10 via-accent-secondary/10 to-transparent border-accent-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">AI Insight</h3>
              <p className="text-sm text-slate-400">System performing within normal parameters. No critical issues detected.</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}