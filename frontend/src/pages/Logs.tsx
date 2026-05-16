import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, Search, Filter, FileText } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { logsApi } from '@/services/api'
import type { LogEntry } from '@/types'
import { formatDate, getLevelColor } from '@/utils'
import { toast } from '@/components/ui/Toaster'

const LEVEL_COLORS = { ERROR: '#ef4444', WARNING: '#f59e0b', INFO: '#3b82f6', DEBUG: '#10b981' }

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [levelFilter, setLevelFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [uploaded, setUploaded] = useState(false)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const data = await logsApi.getLogs({
        level: levelFilter || undefined,
        search: search || undefined,
        limit: 25,
        offset: page * 25,
      })
      setLogs(data.logs)
      setTotal(data.total)
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useState(() => { fetchLogs() })

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      try {
        await logsApi.uploadLogs(file)
        setUploaded(true)
        toast('Logs uploaded successfully', 'success')
        fetchLogs()
      } catch (error) {
        toast('Failed to upload logs', 'error')
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.log', '.txt'] },
    multiple: false,
  })

  const levelCounts = logs.reduce((acc, log) => {
    acc[log.level] = (acc[log.level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(levelCounts).map(([name, value]) => ({ name, value }))
  const sourceCounts = logs.reduce((acc, log) => {
    acc[log.source] = (acc[log.source] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalPages = Math.ceil(total / 25)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Logs</h1>
          <p className="text-slate-400 mt-1">Upload and analyze log files</p>
        </div>
      </div>

      <motion.div
        {...getRootProps()}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-accent-primary bg-accent-primary/10' : 'border-border hover:border-accent-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <p className="text-slate-300 font-medium">
          {isDragActive ? 'Drop your log file here' : 'Drag and drop a .log or .txt file'}
        </p>
        <p className="text-sm text-slate-500 mt-2">or click to browse</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Log Entries ({total})
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    placeholder="Search logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button onClick={() => { setPage(0); fetchLogs() }}>Search</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                {['ERROR', 'WARNING', 'INFO', 'DEBUG'].map((level) => (
                  <button
                    key={level}
                    onClick={() => { setLevelFilter(levelFilter === level ? '' : level); setPage(0) }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      levelFilter === level
                        ? 'bg-accent-primary text-white'
                        : 'bg-background-secondary text-slate-400 hover:bg-slate-800'
                    }`}
                    style={{ color: levelFilter === level ? 'white' : LEVEL_COLORS[level as keyof typeof LEVEL_COLORS] }}
                  >
                    {level}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : logs.length === 0 ? (
                  <p className="text-center text-slate-500 py-12">No logs found. Upload a log file to get started.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-center gap-4 p-4 rounded-xl bg-background-secondary/50 hover:bg-background-secondary transition-colors">
                      <Badge variant={getLevelColor(log.level)}>{log.level}</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 truncate font-mono">{log.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{log.source}</p>
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">{formatDate(log.timestamp)}</span>
                    </div>
                  ))
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => { setPage(p => p - 1); fetchLogs() }}>Previous</Button>
                  <span className="text-sm text-slate-400">Page {page + 1} of {totalPages}</span>
                  <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); fetchLogs() }}>Next</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Severity Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={LEVEL_COLORS[entry.name as keyof typeof LEVEL_COLORS] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #1e293b', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {Object.entries(levelCounts).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{level}</span>
                    <span className="font-medium text-slate-200">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Entries</span>
                  <span className="font-semibold text-slate-200">{total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Sources</span>
                  <span className="font-semibold text-slate-200">{Object.keys(sourceCounts).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}