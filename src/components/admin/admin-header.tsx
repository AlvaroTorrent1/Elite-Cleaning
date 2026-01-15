'use client'

import { Menu, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import NotificationBell from '@/components/shared/notification-bell'

interface AdminHeaderProps {
  profile: {
    id: string
    full_name: string | null
    email: string
  }
}

export default function AdminHeader({ profile }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Mobile menu button */}
        <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        {/* Page title - will be dynamic */}
        <div className="flex-1 lg:block hidden">
          <h2 className="text-lg font-semibold text-gray-900">Panel de Administración</h2>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <NotificationBell userId={profile.id} />
          
          {/* User menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {profile.full_name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500">{profile.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
