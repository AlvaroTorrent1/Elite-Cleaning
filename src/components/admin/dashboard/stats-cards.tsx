import {
  Home,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  UserCheck,
  AlertTriangle,
} from 'lucide-react'
import { StatCard, StatCardGrid, IconVariant } from '@/components/ui'

/**
 * StatsCards - Dashboard del Admin
 * 
 * Usa las variantes de iconos corporativos (rosa/lila)
 * en lugar de colores variados.
 */

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
  // Definimos los stats usando variantes de la paleta corporativa
  const cards: Array<{
    name: string
    value: number
    icon: typeof Home
    variant: IconVariant
  }> = [
    {
      name: 'Propiedades',
      value: stats.totalProperties,
      icon: Home,
      variant: 'primary',    // Rosa principal
    },
    {
      name: 'Usuarios',
      value: stats.totalUsers,
      icon: Users,
      variant: 'secondary',  // Lila
    },
    {
      name: 'Limpiezas Totales',
      value: stats.totalCleanings,
      icon: Calendar,
      variant: 'accent1',    // Rosa oscuro
    },
    {
      name: 'Limpiezas Pendientes',
      value: stats.pendingCleanings,
      icon: Clock,
      variant: 'accent2',    // Lila claro
    },
    {
      name: 'Completadas Hoy',
      value: stats.completedToday,
      icon: CheckCircle,
      variant: 'accent3',    // Rosa suave
    },
    {
      name: 'PMs Pendientes Aprobación',
      value: stats.pendingApprovals,
      icon: UserCheck,
      variant: 'accent4',    // Lila profundo
    },
    {
      name: 'Daños Sin Resolver',
      value: stats.unresolvedDamages,
      icon: AlertTriangle,
      variant: 'accent5',    // Rosa intenso (para alertas)
    },
  ]

  return (
    <StatCardGrid columns={4}>
      {cards.map((card) => (
        <StatCard
          key={card.name}
          title={card.name}
          value={card.value}
          icon={card.icon}
          variant={card.variant}
        />
      ))}
    </StatCardGrid>
  )
}
