import { createClient } from '@/lib/supabase/server'
import { AlertTriangle } from 'lucide-react'
import DamageReportCard from '@/components/pm/reports/damage-report-card'
import { PageHeader, StatCard, StatCardGrid, Card, EmptyState } from '@/components/ui'

export default async function PMDanosPage() {
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
          icon={AlertTriangle}
          title="No tienes propiedades asignadas"
          description="Contacta con el administrador para que te asigne propiedades"
        />
      </Card>
    )
  }

  // Obtener limpiezas de las propiedades del PM
  const { data: cleanings } = await supabase
    .from('cleanings')
    .select('id')
    .in('property_id', propertyIds)

  const cleaningIds = cleanings?.map((c) => c.id) || []

  // Obtener reportes de daños
  const { data: damageReports } = await supabase
    .from('damage_reports')
    .select(
      `
      *,
      cleaning:cleanings!inner(
        id,
        scheduled_date,
        property:properties(id, name, address)
      ),
      damage_item:damage_catalog(name, category, estimated_price),
      reporter:profiles!damage_reports_reported_by_fkey(full_name)
    `
    )
    .in('cleaning_id', cleaningIds)
    .order('created_at', { ascending: false })

  const totalCost = damageReports?.reduce(
    (sum, r) => sum + parseFloat(r.estimated_cost || '0'),
    0
  ) || 0

  const pendingCount = damageReports?.filter((r) => !r.acknowledged_by_pm).length || 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes de Daños"
        description="Daños reportados por el equipo de limpieza"
      />

      {/* Stats */}
      <StatCardGrid columns={3}>
        <StatCard
          title="Total Reportes"
          value={damageReports?.length || 0}
          icon={AlertTriangle}
          variant="primary"
        />
        <StatCard
          title="Pendientes"
          value={pendingCount}
          icon={AlertTriangle}
          variant="accent5"
        />
        <StatCard
          title="Costo Estimado"
          value={`€${totalCost.toFixed(2)}`}
          icon={AlertTriangle}
          variant="accent4"
        />
      </StatCardGrid>

      {/* Reports List */}
      <div className="space-y-4">
        {!damageReports || damageReports.length === 0 ? (
          <Card className="text-center py-12">
            <EmptyState
              icon={AlertTriangle}
              title="No hay reportes de daños"
              description="Los daños reportados por el equipo de limpieza aparecerán aquí"
            />
          </Card>
        ) : (
          damageReports.map((report) => (
            <DamageReportCard key={report.id} report={report} />
          ))
        )}
      </div>
    </div>
  )
}
