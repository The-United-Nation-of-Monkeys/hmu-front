import { Outlet } from 'react-router-dom'
import { NavBar } from '@/components/NavBar'
import { Sidebar } from '@/components/Sidebar'

export function DashboardLayout() {
  return (
    <div className="flex h-screen flex-col">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

