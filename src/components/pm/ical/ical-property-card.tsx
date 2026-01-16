'use client'

import { useState } from 'react'
import { MapPin, Settings, RefreshCw, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface IcalConfig {
  id: string
  platform: 'airbnb' | 'booking' | 'other'
  ical_url: string
  ical_name: string | null
  last_sync_at: string | null
  last_sync_status: 'pending' | 'syncing' | 'success' | 'error'
  last_sync_error: string | null
  last_sync_events_found: number
  last_sync_cleanings_created: number
  is_active: boolean
}

interface Property {
  id: string
  name: string
  address: string
  ical_sync_configs: IcalConfig[]
}

interface IcalPropertyCardProps {
  property: Property
  onConfigureClick: () => void
}

// Platform logos/colors
const platformConfig = {
  airbnb: {
    name: 'Airbnb',
    color: 'bg-[#FF5A5F] text-white',
    icon: '🏠',
  },
  booking: {
    name: 'Booking',
    color: 'bg-[#003580] text-white',
    icon: '🅱️',
  },
  other: {
    name: 'Otro',
    color: 'bg-gray-500 text-white',
    icon: '📅',
  },
}

export default function IcalPropertyCard({ property, onConfigureClick }: IcalPropertyCardProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null)

  const configs = property.ical_sync_configs || []
  const hasConfigs = configs.length > 0
  const hasErrors = configs.some(c => c.last_sync_status === 'error')

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncResult(null)

    try {
      const response = await fetch('/api/ical-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property.id }),
      })

      const data = await response.json()

      if (response.ok) {
        setSyncResult({
          success: true,
          message: `Sincronizado: ${data.totals?.eventsFound || 0} reservas, ${data.totals?.cleaningsCreated || 0} limpiezas creadas`,
        })
        // Reload page to show updated data
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setSyncResult({
          success: false,
          message: data.error || 'Error al sincronizar',
        })
      }
    } catch (error) {
      setSyncResult({
        success: false,
        message: 'Error de conexión',
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="bg-muted/30 rounded-lg border border-border p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Property Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{property.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{property.address}</span>
          </div>

          {/* iCal Configs */}
          {hasConfigs ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {configs.map((config) => (
                <IcalConfigBadge key={config.id} config={config} />
              ))}
            </div>
          ) : (
            <div className="mt-3">
              <Badge variant="muted" size="sm">
                Sin calendarios configurados
              </Badge>
            </div>
          )}

          {/* Sync Result Message */}
          {syncResult && (
            <div
              className={`mt-3 text-sm ${
                syncResult.success ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {syncResult.success ? (
                <CheckCircle className="w-4 h-4 inline mr-1" />
              ) : (
                <AlertCircle className="w-4 h-4 inline mr-1" />
              )}
              {syncResult.message}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {hasConfigs && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              className="text-secondary hover:text-secondary hover:bg-secondary/10"
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="ml-1 hidden sm:inline">Sincronizar</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onConfigureClick}
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            <Settings className="w-4 h-4" />
            <span className="ml-1 hidden sm:inline">Configurar</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

function IcalConfigBadge({ config }: { config: IcalConfig }) {
  const platform = platformConfig[config.platform]
  const lastSync = config.last_sync_at
    ? formatDistanceToNow(new Date(config.last_sync_at), { addSuffix: true, locale: es })
    : 'Nunca'

  const statusIcon = () => {
    switch (config.last_sync_status) {
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />
      case 'syncing':
        return <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
      default:
        return <Clock className="w-3 h-3 text-muted" />
    }
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-card border border-border"
      title={
        config.last_sync_status === 'error'
          ? `Error: ${config.last_sync_error}`
          : `Última sync: ${lastSync}`
      }
    >
      <span>{platform.icon}</span>
      <span className="font-medium">{config.ical_name || platform.name}</span>
      {statusIcon()}
      <span className="text-muted-foreground">{config.last_sync_events_found || 0}</span>
    </div>
  )
}
