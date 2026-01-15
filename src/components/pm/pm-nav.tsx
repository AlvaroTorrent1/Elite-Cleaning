'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, AlertTriangle, Package, History, PlusCircle, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/**
 * PMNav - Navegación del panel de Property Manager
 * 
 * Usa la paleta corporativa rosa/lila
 */

const navigation = [
  {
    name: 'Mis Propiedades',
    href: '/pm',
    icon: Home,
  },
  {
    name: 'Limpiezas',
    href: '/pm/limpiezas',
    icon: Calendar,
  },
  {
    name: 'Mensajes',
    href: '/pm/mensajes',
    icon: MessageCircle,
  },
  {
    name: 'Daños',
    href: '/pm/danos',
    icon: AlertTriangle,
  },
  {
    name: 'Objetos Perdidos',
    href: '/pm/objetos-perdidos',
    icon: Package,
  },
  {
    name: 'Histórico',
    href: '/pm/historico',
    icon: History,
  },
  {
    name: 'Nueva Limpieza',
    href: '/pm/nueva-limpieza',
    icon: PlusCircle,
  },
  {
    name: 'Nueva Propiedad',
    href: '/pm/nueva-propiedad',
    icon: PlusCircle,
  },
]

export default function PMNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-card border-b border-border overflow-x-auto">
      <div className="flex gap-1 p-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
