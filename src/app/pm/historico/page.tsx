import { createClient } from '@/lib/supabase/server'
import { History as HistoryIcon, Calendar, Download, CheckCircle, XCircle, BarChart } from 'lucide-react'
import { CleaningStatusBadge } from '@/components/features/cleaning/cleaning-status-badge'
import { PageHeader, StatCard, StatCardGrid, Card, Button, EmptyState } from '@/components/ui'

export default async function PMHistoricoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Obtener propiedades del PM
  const { data: properties } = await supabase
    .from('properties')
    .select('id')
    .eq('property_manager_id', user.id)

  const propertyIds = properties?.map((p) => p.id) || []

  if (propertyIds.length === 0) {
    return (
      <Card className="text-center py-12">
        <EmptyState
          icon={HistoryIcon}
          title="No tienes propiedades asignadas"
          description="Contacta con el administrador para que te asigne propiedades"
        />
      </Card>
    )
  }

  // Obtener limpiezas de los últimos 30 días
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: cleanings, count } = await supabase
    .from('cleanings')
    .select(
      `
      *,
      property:properties(id, name, address),
      cleaner:profiles!cleanings_cleaner_id_fkey(id, full_name),
      cleaning_type:cleaning_types(name)
    `,
      { count: 'exact' }
    )
    .in('property_id', propertyIds)
    .gte('scheduled_date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('scheduled_date', { ascending: false })

  // Calcular estadísticas
  const completedCount = cleanings?.filter((c) => c.status === 'completed').length || 0
  const cancelledCount = cleanings?.filter((c) => c.status === 'cancelled').length || 0
  const completionRate = count && count > 0 ? Math.round((completedCount / count) * 100) : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico de Limpiezas"
        description="Limpiezas de los últimos 30 días"
        action={
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
            Exportar
          </Button>
        }
      />

      {/* Stats */}
      <StatCardGrid columns={4}>
        <StatCard
          title="Total"
          value={count || 0}
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="Completadas"
          value={completedCount}
          icon={CheckCircle}
          variant="accent3"
        />
        <StatCard
          title="Canceladas"
          value={cancelledCount}
          icon={XCircle}
          variant="accent5"
        />
        <StatCard
          title="Tasa Completado"
          value={`${completionRate}%`}
          icon={BarChart}
          variant="secondary"
        />
      </StatCardGrid>

      {/* Timeline */}
      <Card padding="none">
        <div className="px-6 py-3 border-b border-border">
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{cleanings?.length || 0}</span> limpiezas
          </p>
        </div>

        <div className="divide-y divide-border">
          {!cleanings || cleanings.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <EmptyState
                icon={HistoryIcon}
                title="No hay limpiezas en el histórico"
                description="Las limpiezas completadas aparecerán aquí"
              />
            </div>
          ) : (
            cleanings.map((cleaning) => (
              <div key={cleaning.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Property */}
                    <div>
                      <p className="font-semibold text-foreground">
                        {cleaning.property?.name || 'Sin propiedad'}
                      </p>
                      <p className="text-sm text-muted-foreground">{cleaning.property?.address}</p>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(cleaning.scheduled_date).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <span>
                        {cleaning.cleaning_type?.name || 'N/A'}
                      </span>
                      <span>
                        Por: {cleaning.cleaner?.full_name || 'Sin asignar'}
                      </span>
                      {cleaning.completed_at && (
                        <span className="text-primary">
                          ✓ Completada:{' '}
                          {new Date(cleaning.completed_at).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>

                    {/* Notes if any */}
                    {cleaning.notes && (
                      <p className="text-sm text-muted-foreground italic">
                        Notas: {cleaning.notes}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <CleaningStatusBadge status={cleaning.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
