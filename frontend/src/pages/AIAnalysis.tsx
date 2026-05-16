import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, AlertTriangle, Lightbulb, FileText, Download, Loader2, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { logsApi } from '@/services/api'
import type { LogAnalysis } from '@/types'
import { toast } from '@/components/ui/Toaster'

export default function AIAnalysis() {
  const [analysis, setAnalysis] = useState<LogAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  const runAnalysis = async () => {
    setLoading(true)
    try {
      const data = await logsApi.analyzeLogs([])
      setAnalysis(data)
      toast('Analysis complete', 'success')
    } catch (error) {
      toast('Analysis failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runAnalysis()
  }, [])

  const downloadReport = () => {
    if (!analysis) return
    const content = `
AI Log Analysis Report
======================

Summary:
${analysis.summary}

Issues Found:
${analysis.issues.map(i => `- ${i}`).join('\n')}

Severity Breakdown:
${Object.entries(analysis.severity_breakdown).map(([k, v]) => `${k}: ${v}`).join('\n')}

Root Causes:
${analysis.root_causes.map(r => `- ${r}`).join('\n')}

Recommendations:
${analysis.recommendations.map(r => `- ${r}`).join('\n')}
    `.trim()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'analysis-report.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">AI Analysis</h1>
            <p className="text-slate-400 text-sm">AI-powered log analysis and insights</p>
          </div>
        </div>
        <Button onClick={runAnalysis} disabled={loading} className="bg-accent-primary hover:bg-accent-primary/90">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center animate-pulse">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <p className="text-slate-400">Analyzing logs...</p>
          </div>
        </div>
      ) : analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Card className="bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border-accent-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-accent-primary" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-slate-200 leading-relaxed">{analysis.summary}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Severity Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analysis.severity_breakdown).map(([level, count]) => (
                    <div key={level} className="flex items-center gap-4">
                      <span className={`badge ${level.toLowerCase()} w-20`}>{level}</span>
                      <div className="flex-1 h-3 bg-background-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            level === 'ERROR' ? 'bg-red-500' : level === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min((count / Math.max(...Object.values(analysis.severity_breakdown))) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-300 w-8">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Issues Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.issues.length === 0 ? (
                  <p className="text-slate-500">No issues detected</p>
                ) : (
                  <ul className="space-y-3">
                    {analysis.issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                        <span className="text-sm text-slate-300">{issue}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.recommendations.length === 0 ? (
                  <p className="text-slate-500">No recommendations</p>
                ) : (
                  <ul className="space-y-3">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <Lightbulb className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <span className="text-sm text-slate-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {analysis.root_causes.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Root Cause Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.root_causes.map((cause, i) => (
                      <li key={i} className="flex items-center gap-3 p-4 rounded-xl bg-background-secondary">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                          <span className="text-amber-400 font-bold">{i + 1}</span>
                        </div>
                        <span className="text-sm text-slate-300">{cause}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Button onClick={downloadReport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </motion.div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">Click "Run Analysis" to analyze your logs</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}