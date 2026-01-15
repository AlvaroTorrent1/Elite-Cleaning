'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard,
  Users,
  Home,
  ClipboardList,
  Calendar,
  AlertTriangle,
  Package,
  Settings,
  FileText,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface AdminSidebarProps {
  profile: {
    full_name: string | null
    email: string
  }
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Usuarios',
    href: '/admin/usuarios',
    icon: Users,
  },
  {
    name: 'Propiedades',
    href: '/admin/propiedades',
    icon: Home,
  },
  {
    name: 'Limpiezas',
    href: '/admin/limpiezas',
    icon: Calendar,
  },
  {
    name: 'Reportes de Daños',
    href: '/admin/danos',
    icon: AlertTriangle,
  },
  {
    name: 'Objetos Perdidos',
    href: '/admin/objetos-perdidos',
    icon: Package,
  },
  {
    name: 'Tipos de Limpieza',
    href: '/admin/tipos-limpieza',
    icon: ClipboardList,
  },
  {
    name: 'Checklists',
    href: '/admin/checklists',
    icon: FileText,
  },
  {
    name: 'Catálogo de Daños',
    href: '/admin/catalogo-danos',
    icon: DollarSign,
  },
  {
    name: 'Configuración',
    href: '/admin/configuracion',
    icon: Settings,
  },
]

export default function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div className="lg:hidden fixed inset-0 bg-gray-900/50 z-40" />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 overflow-y-auto lg:block hidden">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 px-4">
          <Image
            src="/logos/My Elite Cleaning Logo Simple.png"
            alt="Elite Cleaning"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {profile.full_name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate">Administrador</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
