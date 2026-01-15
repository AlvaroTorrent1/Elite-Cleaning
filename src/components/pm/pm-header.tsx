'use client'

import { LogOut, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PMHeaderProps {
  profile: {
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
          <button
            className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors relative"
            title="Notificaciones"
          >
            <Bell className="w-5 h-5 text-[#6B7280]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full"></span>
          </button>
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
