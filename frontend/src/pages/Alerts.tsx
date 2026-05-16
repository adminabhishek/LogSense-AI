import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { alertsApi } from '@/services/api'
import type { Alert } from '@/types'
import { formatDate } from '@/utils'
import { toast } from '@/components/ui/Toaster'

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [history, setHistory] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  const fetchAlerts = async () => {
    try {
      const [active, all] = await Promise.all([
        alertsApi.getAlerts(true),
        alertsApi.getAlerts(false),
      ])
      setAlerts(active)
      setHistory(all)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleAcknowledge = async (id: number) => {
    try {
      await alertsApi.acknowledgeAlert(id)
      toast('Alert acknowledged', 'success')
      fetchAlerts()
    } catch (error) {
      toast('Failed to acknowledge', 'error')
    }
  }

  const handleResolve = async (id: number) => {
    try {
      await alertsApi.resolveAlert(id)
      toast('Alert resolved', 'success')
      fetchAlerts()
    } catch (error) {
      toast('Failed to resolve', 'error')
    }
  }

  const alertCountData = history.slice(-20).map((a, i) => ({
    time: formatDate(a.timestamp).split(' ')[1],
    count: i + 1,
  }))

  const activeAlerts = showHistory ? history : alerts
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length
  const warningCount = activeAlerts.filter(a => a.severity === 'warning').length

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />
      default: return <Bell className="w-5 h-5 text-blue-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Alerts</h1>
          <p className="text-slate-400 mt-1">Monitor and manage system alerts</p>
        </div>
        <Button variant="secondary" onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? 'Show Active' : 'Show History'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Critical</p>
                <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Warning</p>
                <p className="text-2xl font-bold text-amber-400">{warningCount}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total</p>
                <p className="text-2xl font-bold text-emerald-400">{history.length}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle>Alert Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={alertCountData}>
                <defs>
                  <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #1e293b', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} fill="url(#alertGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle>{showHistory ? 'Alert History' : 'Active Alerts'}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activeAlerts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <p className="text-slate-400">No alerts to display</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center gap-4 p-4 rounded-xl bg-background-secondary/50 hover:bg-background-secondary transition-colors">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant={alert.severity === 'critical' ? 'error' : 'warning'}>{alert.severity}</Badge>
                        <span className="font-medium text-slate-200">{alert.title}</span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{alert.message}</p>
                      <p className="text-xs text-slate-500 mt-2">{formatDate(alert.timestamp)}</p>
                    </div>
                    <div className="flex gap-2">
                      {!alert.is_acknowledged && (
                        <Button size="sm" variant="secondary" onClick={() => handleAcknowledge(alert.id)}>Acknowledge</Button>
                      )}
                      {!alert.is_resolved && (
                        <Button size="sm" onClick={() => handleResolve(alert.id)}>Resolve</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}