import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Cpu, HardDrive, MemoryStick, Clock, AlertTriangle, FileText, Sparkles } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { metricsApi, logsApi, alertsApi } from '@/services/api'
import type { Metrics, LogEntry, Alert, MetricsHistory } from '@/types'
import { formatDate, getLevelColor } from '@/utils'

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [history, setHistory] = useState<MetricsHistory | null>(null)
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([])
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [metricsData, historyData, logsData, alertsData] = await Promise.all([
        metricsApi.getMetrics(),
        metricsApi.getHistory(),
        logsApi.getLogs({ limit: 10 }),
        alertsApi.getAlerts(true),
      ])
      setMetrics(metricsData)
      setHistory(historyData)
      setRecentLogs(logsData.logs)
      setRecentAlerts(alertsData.slice(0, 5))
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

  const chartData = history?.timestamps.map((ts, i) => ({
    time: new Date(ts).toLocaleTimeString(),
    cpu: history.cpu_percent[i],
    memory: history.memory_percent[i],
  })) || []

  const pieData = metrics ? [
    { name: 'Used', value: metrics.memory_used },
    { name: 'Available', value: metrics.memory_available },
  ] : []

  const statCards = [
    { icon: Cpu, label: 'CPU Usage', value: metrics?.cpu_percent.toFixed(1) || '0', unit: '%', color: 'from-purple-500 to-pink-500' },
    { icon: MemoryStick, label: 'Memory', value: metrics?.memory_percent.toFixed(1) || '0', unit: '%', color: 'from-blue-500 to-cyan-500' },
    { icon: HardDrive, label: 'Disk', value: metrics?.disk_percent.toFixed(1) || '0', unit: '%', color: 'from-emerald-500 to-teal-500' },
    { icon: Clock, label: 'Uptime', value: metrics?.uptime || '0', unit: '', color: 'from-amber-500 to-orange-500' },
  ]

  if (loading) {
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
          <p className="text-slate-400 mt-1">Real-time infrastructure monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-dot success" />
          <span className="text-sm text-slate-400">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-100">
                    {stat.value}<span className="text-sm text-slate-500 ml-1">{stat.unit}</span>
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
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
              <CardTitle>Memory Distribution</CardTitle>
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
                <p className="text-2xl font-bold text-slate-100">{metrics?.memory_used.toFixed(1)} GB</p>
                <p className="text-sm text-slate-400">of {metrics?.memory_total.toFixed(1)} GB used</p>
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
                Recent Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLogs.length === 0 ? (
                  <p className="text-slate-500 text-sm">No logs available</p>
                ) : (
                  recentLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-background-secondary/50">
                      <Badge variant={getLevelColor(log.level)}>{log.level}</Badge>
                      <span className="flex-1 text-sm text-slate-300 truncate">{log.message}</span>
                      <span className="text-xs text-slate-500">{formatDate(log.timestamp)}</span>
                    </div>
                  ))
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
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-sm text-emerald-400">All systems operating normally</p>
                  </div>
                ) : (
                  recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg bg-background-secondary/50">
                      <Badge variant={alert.severity === 'critical' ? 'error' : 'warning'}>{alert.severity}</Badge>
                      <span className="flex-1 text-sm text-slate-300 truncate">{alert.title}</span>
                    </div>
                  ))
                )}
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