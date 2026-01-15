'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, AlertTriangle, Package, History, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

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
]

export default function PMNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-[#E5E7EB] overflow-x-auto">
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
                  ? 'bg-[#1E40AF] text-white'
                  : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
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
