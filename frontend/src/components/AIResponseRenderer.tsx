import { ReactNode } from 'react'
import { CheckCircle, AlertTriangle, Info, XCircle, Cpu, HardDrive, Activity, Zap } from 'lucide-react'

interface SectionProps {
  title?: string
  icon?: ReactNode
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}

export function ResponseSection({ title, icon, children, variant = 'default' }: SectionProps) {
  const variantStyles = {
    default: 'border-slate-700/50 bg-slate-800/30',
    success: 'border-emerald-500/30 bg-emerald-500/10',
    warning: 'border-amber-500/30 bg-amber-500/10',
    error: 'border-red-500/30 bg-red-500/10',
    info: 'border-blue-500/30 bg-blue-500/10',
  }

  const iconColors = {
    default: 'text-slate-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-red-400',
    info: 'text-blue-400',
  }

  return (
    <div className={`border rounded-lg p-4 ${variantStyles[variant]}`}>
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-3">
          {icon && <span className={iconColors[variant]}>{icon}</span>}
          {title && <h4 className={`font-semibold ${iconColors[variant]}`}>{title}</h4>}
        </div>
      )}
      <div className="text-slate-300">{children}</div>
    </div>
  )
}

interface ListItemProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}

export function ResponseListItem({ children, variant = 'default' }: ListItemProps) {
  const bullets = {
    default: '•',
    success: '✓',
    warning: '⚠',
    error: '✗',
    info: '→',
  }

  const colors = {
    default: 'text-slate-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-red-400',
    info: 'text-blue-400',
  }

  return (
    <div className="flex items-start gap-2 py-1">
      <span className={`${colors[variant]} mt-0.5`}>{bullets[variant]}</span>
      <span className="text-slate-300">{children}</span>
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string | number
  status?: 'good' | 'warning' | 'critical'
  icon?: ReactNode
}

export function MetricCard({ label, value, status = 'good', icon }: MetricCardProps) {
  const statusColors = {
    good: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    warning: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    critical: 'text-red-400 border-red-500/30 bg-red-500/10',
  }

  return (
    <div className={`border rounded-lg p-3 ${statusColors[status]}`}>
      <div className="flex items-center gap-2">
        {icon && <span className="opacity-70">{icon}</span>}
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  )
}

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 overflow-x-auto">
      {language && (
        <div className="text-xs text-slate-500 mb-2 uppercase">{language}</div>
      )}
      <pre className="text-sm text-green-400 font-mono">{code}</pre>
    </div>
  )
}

interface Props {
  content: string
}

export function AIResponseRenderer({ content }: Props) {
  const lines = content.split('\n')
  const elements: ReactNode[] = []
  let currentSection: { title?: string; items: string[]; variant?: SectionProps['variant'] } | null = null
  let inList = false

  const flushSection = () => {
    if (currentSection) {
      if (currentSection.title) {
        elements.push(
          <ResponseSection key={elements.length} title={currentSection.title} variant={currentSection.variant}>
            {currentSection.items.map((item, i) => (
              <ResponseListItem key={i} variant={currentSection.variant}>{item}</ResponseListItem>
            ))}
          </ResponseSection>
        )
      } else {
        elements.push(
          <div key={elements.length} className="space-y-1">
            {currentSection.items.map((item, i) => (
              <ResponseListItem key={i} variant={currentSection.variant}>{item}</ResponseListItem>
            ))}
          </div>
        )
      }
      currentSection = null
    }
  }

  const detectVariant = (text: string): SectionProps['variant'] => {
    const lower = text.toLowerCase()
    if (lower.includes('error') || lower.includes('critical') || lower.includes('failed')) return 'error'
    if (lower.includes('warning') || lower.includes('caution')) return 'warning'
    if (lower.includes('success') || lower.includes('healthy') || lower.includes('ok')) return 'success'
    if (lower.includes('info') || lower.includes('note')) return 'info'
    return 'default'
  }

  const detectSectionVariant = (title: string): SectionProps['variant'] => {
    const lower = title.toLowerCase()
    if (lower.includes('issue') || lower.includes('problem') || lower.includes('error')) return 'error'
    if (lower.includes('warning') || lower.includes('risk')) return 'warning'
    if (lower.includes('recommendation') || lower.includes('suggestion') || lower.includes('solution')) return 'success'
    if (lower.includes('info') || lower.includes('detail')) return 'info'
    return 'default'
  }

  const getSectionIcon = (title: string): ReactNode => {
    const lower = title.toLowerCase()
    if (lower.includes('metric') || lower.includes('cpu') || lower.includes('memory')) return <Cpu className="w-4 h-4" />
    if (lower.includes('disk') || lower.includes('storage')) return <HardDrive className="w-4 h-4" />
    if (lower.includes('status') || lower.includes('health')) return <Activity className="w-4 h-4" />
    if (lower.includes('recommend') || lower.includes('solution')) return <Zap className="w-4 h-4" />
    if (lower.includes('error') || lower.includes('issue')) return <AlertTriangle className="w-4 h-4" />
    if (lower.includes('success') || lower.includes('ok')) return <CheckCircle className="w-4 h-4" />
    return <Info className="w-4 h-4" />
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) {
      flushSection()
      inList = false
      continue
    }

    if (line.match(/^#{1,3}\s/)) {
      flushSection()
      const title = line.replace(/^#{1,3}\s/, '')
      currentSection = { title, items: [], variant: detectSectionVariant(title) }
      elements.push(
        <div key={elements.length} className="mt-4 first:mt-0">
          <div className="flex items-center gap-2 mb-2">
            {getSectionIcon(title)}
            <h3 className="font-semibold text-slate-100">{title}</h3>
          </div>
        </div>
      )
      continue
    }

    const sectionKeywords = ['## ', 'Summary:', 'Recommendations:', 'Issues:', 'Details:', 'Analysis:', 'Status:', 'Metrics:']
    if (sectionKeywords.some(kw => line.toLowerCase().startsWith(kw.toLowerCase()))) {
      flushSection()
      const title = line.replace(/^##\s*/, '').replace(/:$/, '')
      currentSection = { title, items: [], variant: detectSectionVariant(title) }
      continue
    }

    if (line.match(/^[-*•]\s/) || line.match(/^\d+[\.\)]\s/)) {
      if (!currentSection) {
        currentSection = { items: [], variant: 'default' }
      }
      currentSection.items.push(line.replace(/^[-*•\d\.\)]+\s*/, ''))
      inList = true
      continue
    }

    if (line.match(/^```[\s\S]*?```$/)) {
      flushSection()
      const code = line.replace(/^```\w*\n?/, '').replace(/```$/, '')
      elements.push(<CodeBlock key={elements.length} code={code} />)
      continue
    }

    if (line.includes(':') && (line.match(/^[A-Z][a-zA-Z]+\s*:/) || line.includes('=') || line.includes(':'))) {
      flushSection()
      const [key, ...valueParts] = line.split(':')
      const value = valueParts.join(':').trim()
      if (value) {
        elements.push(
          <div key={elements.length} className="flex items-center gap-2 py-1 text-sm">
            <span className="text-slate-500">{key}:</span>
            <span className={`font-medium ${detectVariant(value).includes('error') ? 'text-red-400' : detectVariant(value).includes('warning') ? 'text-amber-400' : 'text-slate-200'}`}>
              {value}
            </span>
          </div>
        )
      }
      continue
    }

    if (currentSection && currentSection.items.length > 0) {
      currentSection.items.push(line)
    } else if (currentSection) {
      currentSection.items.push(line)
    } else {
      if (line.length > 0) {
        elements.push(
          <p key={elements.length} className="text-slate-300 py-1">{line}</p>
        )
      }
    }
  }

  flushSection()

  return (
    <div className="space-y-2">
      {elements}
    </div>
  )
}