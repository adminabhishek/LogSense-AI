import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Server, Cpu, HardDrive, Network, Activity, Clock, Monitor } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { systemApi } from '@/services/api'
import type { SystemInfo } from '@/types'
import { formatBytes } from '@/utils'

export default function SystemDetails() {
  const [system, setSystem] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    systemApi.getSystemInfo()
      .then(setSystem)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">System Details</h1>
        <p className="text-slate-400 mt-1">Comprehensive system information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Server className="w-5 h-5 text-white" />
              </div>
              <CardTitle>Operating System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-slate-400">System</span><span className="text-slate-200">{system?.os.system}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Release</span><span className="text-slate-200">{system?.os.release}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Version</span><span className="text-slate-200">{system?.os.version}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Machine</span><span className="text-slate-200">{system?.os.machine}</span></div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-white" />
              </div>
              <CardTitle>Host Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-slate-400">Hostname</span><span className="text-slate-200 font-mono">{system?.hostname}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Uptime</span><span className="text-slate-200">{system?.uptime}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Processor</span><span className="text-slate-200 text-sm">{system?.os.processor}</span></div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <CardTitle>CPU</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-slate-400">Physical Cores</span><span className="text-slate-200">{system?.cpu.physical_cores}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Logical Cores</span><span className="text-slate-200">{system?.cpu.logical_cores}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Max Frequency</span><span className="text-slate-200">{system?.cpu.max_frequency}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Current</span><span className="text-slate-200">{system?.cpu.current_frequency}</span></div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <CardTitle>Memory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-slate-400">Total</span><span className="text-slate-200">{system?.memory.total} GB</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Used</span><span className="text-slate-200">{system?.memory.used} GB</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Available</span><span className="text-slate-200">{system?.memory.available} GB</span></div>
              <div className="mt-3">
                <div className="flex justify-between mb-1"><span className="text-slate-400">Usage</span><span className="text-slate-200">{system?.memory.percent}%</span></div>
                <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${system?.memory.percent}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-white" />
              </div>
              <CardTitle>Disk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-slate-400">Total</span><span className="text-slate-200">{system?.disk.total} GB</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Used</span><span className="text-slate-200">{system?.disk.used} GB</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Free</span><span className="text-slate-200">{system?.disk.free} GB</span></div>
              <div className="mt-3">
                <div className="flex justify-between mb-1"><span className="text-slate-400">Usage</span><span className="text-slate-200">{system?.disk.percent}%</span></div>
                <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-full" style={{ width: `${system?.disk.percent}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Network className="w-5 h-5 text-white" />
              </div>
              <CardTitle>Network</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {system?.network.map((n, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-slate-400">{n.name}</span>
                  <span className="text-slate-200 font-mono text-sm">{n.ip}</span>
                </div>
              ))}
              {system?.network.length === 0 && <p className="text-slate-500 text-sm">No network interfaces</p>}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader>
            <CardTitle>Top Processes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {system?.top_processes.map((proc, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background-secondary/50">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-accent-primary/20 text-accent-primary text-xs flex items-center justify-center">{i + 1}</span>
                    <span className="text-slate-200 font-mono text-sm">{proc.name}</span>
                  </div>
                  <span className="text-slate-400 text-sm">PID: {proc.pid}</span>
                  <span className="text-accent-primary font-medium">{proc.cpu}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}