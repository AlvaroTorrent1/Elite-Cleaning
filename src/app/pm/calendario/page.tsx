import { createClient } from '@/lib/supabase/server'
import { RefreshCw, Calendar, CheckCircle, AlertCircle, Clock, Plus } from 'lucide-react'
import { Card, PageHeader } from '@/components/ui'
import IcalPropertyList from '@/components/pm/ical/ical-property-list'
import IcalSyncSummary from '@/components/pm/ical/ical-sync-summary'

export default async function PMCalendarioPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Obtener propiedades del PM con sus configuraciones iCal
  const { data: properties } = await supabase
    .from('properties')
    .select(`
      *,
      ical_sync_configs (*)
    `)
    .eq('property_manager_id', user.id)
    .order('name')

  // Calcular estadísticas
  const stats = {
    totalProperties: properties?.length || 0,
    propertiesWithIcal: properties?.filter(p => p.ical_sync_configs?.length > 0).length || 0,
    propertiesWithoutIcal: properties?.filter(p => !p.ical_sync_configs?.length).length || 0,
    totalConfigs: properties?.reduce((sum, p) => sum + (p.ical_sync_configs?.length || 0), 0) || 0,
    configsWithError: properties?.reduce((sum, p) => 
      sum + (p.ical_sync_configs?.filter((c: { last_sync_status: string }) => c.last_sync_status === 'error').length || 0), 0
    ) || 0,
    lastSyncAt: properties
      ?.flatMap(p => p.ical_sync_configs || [])
      .filter((c: { last_sync_at: string | null }) => c.last_sync_at)
      .sort((a: { last_sync_at: string }, b: { last_sync_at: string }) => 
        new Date(b.last_sync_at).getTime() - new Date(a.last_sync_at).getTime()
      )[0]?.last_sync_at || null,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario iCal"
        description="Sincroniza reservas de Airbnb, Booking y otras plataformas automáticamente"
        icon={RefreshCw}
      />

      {/* Resumen de sincronización */}
      <IcalSyncSummary stats={stats} />

      {/* Lista de propiedades con configuración iCal */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Mis Propiedades</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{stats.propertiesWithIcal} con iCal</span>
            </div>
            <span className="text-border">|</span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-muted" />
              <span>{stats.propertiesWithoutIcal} sin configurar</span>
            </div>
          </div>
        </div>

        {!properties || properties.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted-foreground">No tienes propiedades aún</p>
            <p className="text-sm text-muted-foreground mt-1">
              Añade una propiedad para empezar a sincronizar calendarios
            </p>
          </div>
        ) : (
          <IcalPropertyList properties={properties} />
        )}
      </Card>

      {/* Información sobre sincronización automática */}
      <Card className="bg-secondary/5 border-secondary/20">
        <div className="flex items-start gap-3">
          <RefreshCw className="w-5 h-5 text-secondary mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground">Sincronización automática</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Los calendarios se sincronizan automáticamente cada 15 minutos. 
              Las limpiezas se generan en la fecha de check-out de cada reserva.
              Si hay un check-in el mismo día, la limpieza se marca como <strong>urgente</strong>.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
