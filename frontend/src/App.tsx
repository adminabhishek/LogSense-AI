import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/Toaster'
import DashboardLayout from '@/layouts/DashboardLayout'
import Dashboard from '@/pages/Dashboard'
import Logs from '@/pages/Logs'
import AIAnalysis from '@/pages/AIAnalysis'
import Alerts from '@/pages/Alerts'
import SystemDetails from '@/pages/SystemDetails'
import Settings from '@/pages/Settings'
import AIAssistant from '@/pages/AIAssistant'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="logs" element={<Logs />} />
          <Route path="analysis" element={<AIAnalysis />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="system" element={<SystemDetails />} />
          <Route path="settings" element={<Settings />} />
          <Route path="assistant" element={<AIAssistant />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App