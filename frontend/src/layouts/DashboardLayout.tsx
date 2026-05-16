import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background-primary">
      <Sidebar />
      <main className="ml-60 p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}