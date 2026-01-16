import { createClient } from '@/lib/supabase/server'
import { RefreshCw, Calendar, CheckCircle, Clock, Settings } from 'lucide-react'
import { Card, PageHeader } from '@/components/ui'
import IcalPropertyList from '@/components/pm/ical/ical-property-list'
import IcalSyncSummary from '@/components/pm/ical/ical-sync-summary'
import ReservationsCalendar from '@/components/pm/calendar/reservations-calendar'
import Link from 'next/link'

import '@/styles/calendar.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

  const propertyIds = properties?.map(p => p.id) || []

  // Obtener todas las limpiezas con información de iCal para el calendario
  const { data: cleanings } = await supabase
    .from('cleanings')
    .select(`
      id,
      property_id,
      ical_guest_name,
      ical_check_in_date,
      ical_check_out_date,
      ical_platform,
      is_urgent,
      status,
      scheduled_date,
      property:properties(id, name)
    `)
    .in('property_id', propertyIds)
    .not('ical_check_in_date', 'is', null)
    .order('ical_check_in_date', { ascending: true })

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

  // Transformar propiedades para el calendario
  const calendarProperties = properties?.map(p => ({
    id: p.id,
    name: p.name,
  })) || []

  // Transformar cleanings para el calendario
  const calendarCleanings = cleanings?.map(c => ({
    id: c.id,
    property_id: c.property_id,
    ical_guest_name: c.ical_guest_name,
    ical_check_in_date: c.ical_check_in_date,
    ical_check_out_date: c.ical_check_out_date,
    ical_platform: c.ical_platform as 'airbnb' | 'booking' | 'other' | null,
    is_urgent: c.is_urgent,
    status: c.status,
    scheduled_date: c.scheduled_date,
    property: c.property as { id: string; name: string } | undefined,
  })) || []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario iCal"
        description="Sincroniza reservas de Airbnb, Booking y otras plataformas automáticamente"
        icon={RefreshCw}
      />

      {/* Resumen de sincronización */}
      <IcalSyncSummary stats={stats} />

      {/* Calendario de Reservas */}
      {properties && properties.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-secondary" />
              Calendario de Reservas
            </h2>
            <span className="text-sm text-muted-foreground">
              {cleanings?.length || 0} reservas sincronizadas
            </span>
          </div>

          {cleanings && cleanings.length > 0 ? (
            <ReservationsCalendar 
              properties={calendarProperties} 
              cleanings={calendarCleanings} 
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar className="w-12 h-12 text-muted mx-auto mb-3" />
              <p className="text-muted-foreground">No hay reservas sincronizadas</p>
              <p className="text-sm text-muted-foreground mt-1">
                Configura los calendarios iCal de tus propiedades para ver las reservas aquí
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Lista de propiedades con configuración iCal */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5 text-muted-foreground" />
            Configuración iCal
          </h2>
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
            <Link 
              href="/pm/propiedades/nueva"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Añadir propiedad
            </Link>
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
