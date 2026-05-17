import { useState, useCallback } from 'react'

export interface ClientLogFile {
  id: number
  name: string
  timestamp: string
  entries: {
    level: string
    message: string
    timestamp: string
  }[]
}

export function useClientLogs() {
  const [uploadedLogs, setUploadedLogs] = useState<ClientLogFile[]>([])
  const [loading, setLoading] = useState(false)

  const parseLogLine = (line: string): { level: string; message: string } => {
    // Try to match common log formats
    // Format: [TIMESTAMP] [LEVEL] MESSAGE
    const timestampMatch = line.match(/\[(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}[^\]]*)\]/)
    const levelMatch = line.match(/\[(INFO|WARN|WARNING|ERROR|DEBUG|TRACE)\]/i)
    const level = levelMatch ? levelMatch[1].toUpperCase() : 'INFO'

    // Remove timestamp and level brackets for message
    let message = line
    if (timestampMatch) message = message.replace(timestampMatch[0], '')
    if (levelMatch) message = message.replace(levelMatch[0], '')

    return { level: level.includes('ERR') ? 'ERROR' : level.includes('WARN') ? 'WARNING' : 'INFO', message: message.trim() }
  }

  const uploadLogFile = useCallback(async (file: File): Promise<ClientLogFile> => {
    setLoading(true)

    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const lines = content.split('\n').filter(line => line.trim())

          const entries = lines.slice(0, 100).map(line => ({
            ...parseLogLine(line),
            timestamp: new Date().toISOString()
          }))

          const newLogFile: ClientLogFile = {
            id: Date.now(),
            name: file.name,
            timestamp: new Date().toISOString(),
            entries
          }

          setUploadedLogs(prev => [...prev.slice(-4), newLogFile]) // Keep last 5 files
          setLoading(false)
          resolve(newLogFile)
        } catch (error) {
          setLoading(false)
          reject(error)
        }
      }

      reader.onerror = () => {
        setLoading(false)
        reject(new Error('Failed to read file'))
      }

      reader.readAsText(file)
    })
  }, [])

  const clearLogs = useCallback(() => {
    setUploadedLogs([])
  }, [])

  const getAllEntries = useCallback(() => {
    return uploadedLogs.flatMap(log =>
      log.entries.map(entry => ({
        ...entry,
        source: log.name
      }))
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [uploadedLogs])

  return {
    uploadedLogs,
    loading,
    uploadLogFile,
    clearLogs,
    getAllEntries
  }
}