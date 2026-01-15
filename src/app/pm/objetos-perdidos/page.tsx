import { createClient } from '@/lib/supabase/server'
import { Package } from 'lucide-react'
import LostItemCard from '@/components/pm/reports/lost-item-card'
import { PageHeader, StatCard, StatCardGrid, Card, EmptyState } from '@/components/ui'

export default async function PMObjetosPerdidosPage() {
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
          icon={Package}
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

  // Obtener reportes de objetos perdidos
  const { data: lostItemReports } = await supabase
    .from('lost_item_reports')
    .select(
      `
      *,
      cleaning:cleanings!inner(
        id,
        scheduled_date,
        property:properties(id, name, address)
      ),
      reporter:profiles!lost_item_reports_reported_by_fkey(full_name)
    `
    )
    .in('cleaning_id', cleaningIds)
    .order('created_at', { ascending: false })

  const pendingCount = lostItemReports?.filter((r) => !r.acknowledged_by_pm).length || 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Objetos Perdidos"
        description="Objetos encontrados por el equipo de limpieza"
      />

      {/* Stats */}
      <StatCardGrid columns={2}>
        <StatCard
          title="Total Reportes"
          value={lostItemReports?.length || 0}
          icon={Package}
          variant="primary"
        />
        <StatCard
          title="Sin Revisar"
          value={pendingCount}
          icon={Package}
          variant="accent4"
        />
      </StatCardGrid>

      {/* Reports List */}
      <div className="space-y-4">
        {!lostItemReports || lostItemReports.length === 0 ? (
          <Card className="text-center py-12">
            <EmptyState
              icon={Package}
              title="No hay reportes de objetos perdidos"
              description="Los objetos encontrados por el equipo de limpieza aparecerán aquí"
            />
          </Card>
        ) : (
          lostItemReports.map((report) => <LostItemCard key={report.id} report={report} />)
        )}
      </div>
    </div>
  )
}
