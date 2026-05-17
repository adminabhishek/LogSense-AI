import { useState } from 'react'
import { motion } from 'framer-motion'
import { Server, Cpu, HardDrive, Network, Activity, Clock, Monitor, Smartphone, Tablet, Wifi, Globe, Battery, Eye } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useClientMetrics } from '@/hooks/useClientMetrics'

export default function SystemDetails() {
  const { metrics: clientMetrics, loading } = useClientMetrics()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const getDeviceIcon = () => {
    switch (clientMetrics.deviceType) {
      case 'mobile': return Smartphone
      case 'tablet': return Tablet
      default: return Monitor
    }
  }
  const DeviceIcon = getDeviceIcon()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Your Device Details</h1>
        <p className="text-slate-400 mt-1">Complete information about your device</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <DeviceIcon className="w-5 h-5 text-white" />
              </div>
              <CardTitle>Device Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-slate-400">Device Type</span><span className="text-slate-200 capitalize">{clientMetrics.deviceType}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Operating System</span><span className="text-slate-200">{clientMetrics.os}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Browser</span><span className="text-slate-200">{clientMetrics.browser}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Screen</span><span className="text-slate-200">{clientMetrics.screenWidth} × {clientMetrics.screenHeight}</span></div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <CardTitle>Session Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-slate-400">Current Page</span><span className="text-slate-200 font-mono text-sm">{clientMetrics.pageUrl}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Session Duration</span><span className="text-slate-200">{Math.floor(clientMetrics.sessionDuration / 60)}m {clientMetrics.sessionDuration % 60}s</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Page Load Time</span><span className="text-slate-200">{clientMetrics.pageLoadTime ? `${(clientMetrics.pageLoadTime / 1000).toFixed(2)}s` : 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">User Agent</span><span className="text-slate-200 text-xs truncate" title={navigator.userAgent}>View in DevTools</span></div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <CardTitle>Processor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-slate-400">CPU Cores</span><span className="text-slate-200">{clientMetrics.cpuCores || 'Not detected'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Hardware Concurrency</span><span className="text-slate-200">{navigator.hardwareConcurrency || 'Not available'}</span></div>
              <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Note</p>
                <p className="text-xs text-slate-400">Browser security limits CPU access. Actual cores may be higher than shown.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-white" />
              </div>
              <CardTitle>Memory (RAM)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-slate-400">Device RAM</span><span className="text-slate-200">{clientMetrics.memoryGb ? `${clientMetrics.memoryGb} GB` : 'Not detected'}</span></div>
              <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Note</p>
                <p className="text-xs text-slate-400">Memory detection works mainly in Chrome. Other browsers may show different values.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-white" />
              </div>
              <CardTitle>Network</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-slate-400">Connection Type</span><span className="text-slate-200 capitalize">{clientMetrics.connectionType || 'Unknown'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Effective Speed</span><span className="text-slate-200">{clientMetrics.connectionType || 'N/A'}</span></div>
              <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Note</p>
                <p className="text-xs text-slate-400">Network API not supported in all browsers. Values may vary.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Battery className="w-5 h-5 text-white" />
              </div>
              <CardTitle>Battery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-slate-400">Battery Level</span><span className="text-slate-200">{clientMetrics.batteryLevel !== null ? `${clientMetrics.batteryLevel}%` : 'Not available'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Charging Status</span><span className="text-slate-200">{clientMetrics.batteryCharging !== null ? (clientMetrics.batteryCharging ? 'Charging' : 'Not charging') : 'Not available'}</span></div>
              <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Note</p>
                <p className="text-xs text-slate-400">Battery API supported mainly in Chrome/Edge on desktop. Limited mobile support.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
        <Card className="bg-gradient-to-r from-accent-primary/10 via-accent-secondary/10 to-transparent border-accent-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Client-Side Only</h3>
                <p className="text-sm text-slate-400">This page shows YOUR device information. Different users see different data based on their device, browser, and settings.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}