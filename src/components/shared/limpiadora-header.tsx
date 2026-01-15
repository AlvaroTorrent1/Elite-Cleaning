'use client'

import Image from 'next/image'
import NotificationBell from './notification-bell'

interface LimpiadoraHeaderProps {
  profile: {
    id: string
    full_name: string | null
  }
}

export default function LimpiadoraHeader({ profile }: LimpiadoraHeaderProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logos/My Elite Cleaning Logo Simple.png"
            alt="Elite Cleaning"
            width={100}
            height={32}
            className="object-contain"
          />
          <div className="border-l border-border pl-3">
            <p className="text-sm text-muted-foreground">
              Hola, {profile?.full_name?.split(' ')[0] || 'Limpiadora'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <NotificationBell userId={profile.id} />
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
            {profile?.full_name?.charAt(0) || 'L'}
          </div>
        </div>
      </div>
    </header>
  )
}
