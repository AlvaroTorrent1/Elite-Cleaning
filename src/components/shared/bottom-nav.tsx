'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, History, Settings, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/**
 * BottomNav - Navegación inferior para la app de limpiadora
 * 
 * Usa la paleta corporativa rosa/lila
 */

const navItems = [
  {
    href: '/limpiadora',
    label: 'Inicio',
    icon: Home,
  },
  {
    href: '/limpiadora/mensajes',
    label: 'Mensajes',
    icon: MessageCircle,
  },
  {
    href: '/limpiadora/historial',
    label: 'Historial',
    icon: History,
  },
  {
    href: '/limpiadora/perfil',
    label: 'Perfil',
    icon: Settings,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
