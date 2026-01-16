'use client'

import { RefreshCw, Home, Link2, AlertTriangle, Clock } from 'lucide-react'
import { StatCard, StatCardGrid } from '@/components/ui'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface IcalSyncSummaryProps {
  stats: {
    totalProperties: number
    propertiesWithIcal: number
    propertiesWithoutIcal: number
    totalConfigs: number
    configsWithError: number
    lastSyncAt: string | null
  }
}

export default function IcalSyncSummary({ stats }: IcalSyncSummaryProps) {
  const lastSyncText = stats.lastSyncAt
    ? formatDistanceToNow(new Date(stats.lastSyncAt), { addSuffix: true, locale: es })
    : 'Nunca'

  return (
    <StatCardGrid columns={4}>
      <StatCard
        title="Propiedades"
        value={stats.totalProperties}
        icon={Home}
        variant="primary"
      />
      <StatCard
        title="Calendarios Conectados"
        value={stats.totalConfigs}
        icon={Link2}
        variant="secondary"
      />
      <StatCard
        title="Con Errores"
        value={stats.configsWithError}
        icon={AlertTriangle}
        variant={stats.configsWithError > 0 ? 'accent5' : 'muted'}
      />
      <StatCard
        title="Última Sync"
        value={lastSyncText}
        icon={Clock}
        variant="muted"
      />
    </StatCardGrid>
  )
}
