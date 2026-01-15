'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import NotificationBell from '@/components/shared/notification-bell'

interface PMHeaderProps {
  profile: {
    id: string
    full_name: string | null
    email: string
  }
}

export default function PMHeader({ profile }: PMHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="bg-white border-b border-[#E5E7EB] px-4 py-4">
      <div className="flex items-center justify-between">
        {/* User Info */}
        <div>
          <h2 className="text-lg font-semibold text-[#111827]">
            {profile.full_name || 'Property Manager'}
          </h2>
          <p className="text-sm text-[#6B7280]">{profile.email}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <NotificationBell userId={profile.id} />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </div>
  )
}
