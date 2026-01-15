import {
  Home,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  UserCheck,
  AlertTriangle,
} from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalProperties: number
    totalUsers: number
    totalCleanings: number
    pendingCleanings: number
    completedToday: number
    pendingApprovals: number
    unresolvedDamages: number
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      name: 'Propiedades',
      value: stats.totalProperties,
      icon: Home,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Usuarios',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Limpiezas Totales',
      value: stats.totalCleanings,
      icon: Calendar,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Limpiezas Pendientes',
      value: stats.pendingCleanings,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'Completadas Hoy',
      value: stats.completedToday,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      name: 'PMs Pendientes Aprobación',
      value: stats.pendingApprovals,
      icon: UserCheck,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      name: 'Daños Sin Resolver',
      value: stats.unresolvedDamages,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <div
            key={card.name}
            className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
