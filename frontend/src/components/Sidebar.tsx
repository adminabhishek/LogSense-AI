import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, FileText, Brain, Bell, Server, Settings, MessageSquare, Monitor } from 'lucide-react'
import { cn } from '@/utils'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/logs', icon: FileText, label: 'Logs' },
  { path: '/analysis', icon: Brain, label: 'AI Analysis' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/system', icon: Server, label: 'System' },
  { path: '/clients', icon: Monitor, label: 'Client Devices' },
  { path: '/assistant', icon: MessageSquare, label: 'Assistant' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-screen w-60 bg-background-secondary border-r border-border flex flex-col z-40"
    >
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">AI Infra</h1>
            <p className="text-xs text-slate-500">Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                  : 'text-slate-400 hover:bg-background-card hover:text-slate-200'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400" />
          <div>
            <p className="text-sm font-medium text-slate-200">Admin</p>
            <p className="text-xs text-slate-500">System</p>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}