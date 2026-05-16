import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface TerminalCardProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  variant?: 'green' | 'amber' | 'blue' | 'purple'
}

const VARIANTS = {
  green: {
    border: 'border-green-500/30',
    bg: 'bg-green-500/5',
    text: 'text-green-400',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.15)]',
    prompt: '█',
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    text: 'text-amber-400',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    prompt: '▸',
  },
  blue: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    text: 'text-blue-400',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    prompt: '›',
  },
  purple: {
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/5',
    text: 'text-purple-400',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]',
    prompt: '◆',
  },
}

export function TerminalCard({ title, icon, children, className = '', variant = 'green' }: TerminalCardProps) {
  const style = VARIANTS[variant]

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`rounded-lg border ${style.border} ${style.bg} ${style.glow} overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-black/20">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 text-center">
          <span className={`text-xs font-mono ${style.text}/60`}>{title}</span>
        </div>
        {icon && <div className={style.text}>{icon}</div>}
      </div>
      <div className="p-4 font-mono text-sm">
        {children}
      </div>
    </motion.div>
  )
}

interface TerminalLineProps {
  prefix?: string
  prefixColor?: string
  children: ReactNode
  color?: string
}

export function TerminalLine({ prefix = '>', prefixColor = 'text-green-400', children, color = 'text-green-300' }: TerminalLineProps) {
  return (
    <div className="flex items-start gap-2 py-1">
      <span className={`${prefixColor} mt-0.5`}>{prefix}</span>
      <span className={`${color} whitespace-pre-wrap break-words`}>{children}</span>
    </div>
  )
}

interface TerminalBlockProps {
  children: ReactNode
  label?: string
  variant?: 'green' | 'amber' | 'blue' | 'purple'
}

export function TerminalBlock({ children, label, variant = 'green' }: TerminalBlockProps) {
  const style = VARIANTS[variant]

  return (
    <div className={`border ${style.border} rounded-md my-3`}>
      {label && (
        <div className={`px-2 py-1 border-b ${style.border} ${style.bg} text-xs ${style.text}`}>
          {label}
        </div>
      )}
      <div className="p-3 font-mono text-sm">
        {children}
      </div>
    </div>
  )
}

interface TerminalListProps {
  items: string[]
  variant?: 'green' | 'amber' | 'red' | 'blue'
  prefix?: string
}

export function TerminalList({ items, variant = 'green', prefix = '•' }: TerminalListProps) {
  const colors = {
    green: 'text-green-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
  }

  if (items.length === 0) {
    return <span className="text-slate-500">-- none --</span>
  }

  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className={colors[variant]}>{prefix}</span>
          <span className="text-slate-300">{item}</span>
        </div>
      ))}
    </div>
  )
}

interface TerminalProgressProps {
  label: string
  value: number
  max: number
  variant?: 'green' | 'amber' | 'red' | 'blue'
}

export function TerminalProgress({ label, value, max, variant = 'green' }: TerminalProgressProps) {
  const colors = {
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  }

  const textColors = {
    green: 'text-green-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
  }

  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-slate-400 w-20">{label}:</span>
      <div className="flex-1 h-4 bg-black/40 rounded border border-slate-700 overflow-hidden">
        <div
          className={`h-full ${colors[variant]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`${textColors[variant]} w-12 text-right`}>{value}</span>
    </div>
  )
}

export function TerminalBadge({ children, variant = 'green' }: { children: ReactNode, variant?: 'green' | 'amber' | 'red' | 'blue' }) {
  const colors = {
    green: 'text-green-400 bg-green-500/20 border-green-500/30',
    amber: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    red: 'text-red-400 bg-red-500/20 border-red-500/30',
    blue: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  }

  return (
    <span className={`px-2 py-0.5 rounded text-xs border ${colors[variant]}`}>
      {children}
    </span>
  )
}

interface TerminalInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onSubmit?: () => void
}

export function TerminalInput({ value, onChange, placeholder = 'Enter command...', onSubmit }: TerminalInputProps) {
  return (
    <div className="flex items-center gap-2 bg-black/40 border border-slate-700 rounded-md px-3 py-2">
      <span className="text-green-400">{'>'}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-slate-300 placeholder-slate-600 outline-none font-mono text-sm"
      />
      <span className="text-green-400 animate-pulse">_</span>
    </div>
  )
}