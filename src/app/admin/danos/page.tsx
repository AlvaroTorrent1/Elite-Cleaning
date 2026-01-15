import { createClient } from '@/lib/supabase/server'
import { AlertTriangle, CheckCircle, Clock, Euro } from 'lucide-react'
import DamagesFilters from '@/components/admin/damages/damages-filters'
import DamagesGrid from '@/components/admin/damages/damages-grid'
import { PageHeader, StatCard, StatCardGrid } from '@/components/ui'

export default async function DamagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; property?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Construir query con filtros
  let query = supabase
    .from('damage_reports')
    .select(
      `
      *,
      cleaning:cleanings(
        id,
        scheduled_date,
        property:properties(name, address)
      ),
      reporter:profiles!damage_reports_reported_by_fkey(full_name),
      damage_item:damage_catalog(name, category, estimated_price)
    `,
      { count: 'exact' }
    )

  // Filtrar por estado (acknowledged = revisado, no acknowledged = pendiente)
  if (params.status === 'pending') {
    query = query.eq('acknowledged_by_admin', false)
  } else if (params.status === 'reviewed') {
    query = query.eq('acknowledged_by_admin', true)
  }

  const { data: damages, count } = await query.order('created_at', {
    ascending: false,
  })

  // Obtener estadísticas
  const [
    { count: totalDamages },
    { count: pendingDamages },
    { count: reviewedDamages },
  ] = await Promise.all([
    supabase.from('damage_reports').select('*', { count: 'exact', head: true }),
    supabase
      .from('damage_reports')
      .select('*', { count: 'exact', head: true })
      .eq('acknowledged_by_admin', false),
    supabase
      .from('damage_reports')
      .select('*', { count: 'exact', head: true })
      .eq('acknowledged_by_admin', true),
  ])

  // Calcular total de costos pendientes de revisar
  const { data: pendingCosts } = await supabase
    .from('damage_reports')
    .select('estimated_cost')
    .eq('acknowledged_by_admin', false)

  const totalPendingCost = pendingCosts?.reduce(
    (acc, item) => acc + (Number(item.estimated_cost) || 0),
    0
  ) || 0

  // Obtener propiedades para filtro
  const { data: properties } = await supabase
    .from('properties')
    .select('id, name')
    .order('name')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes de Daños"
        description="Revisa y gestiona los reportes de daños en las propiedades"
      />

      <StatCardGrid columns={4}>
        <StatCard
          title="Total"
          value={totalDamages || 0}
          icon={AlertTriangle}
          iconColor="text-gray-600"
          iconBgColor="bg-gray-50"
        />
        <StatCard
          title="Pendientes"
          value={pendingDamages || 0}
          icon={Clock}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-50"
        />
        <StatCard
          title="Revisados"
          value={reviewedDamages || 0}
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
        />
        <StatCard
          title="Costo Pendiente"
          value={`€${totalPendingCost.toFixed(2)}`}
          icon={Euro}
          iconColor="text-red-600"
          iconBgColor="bg-red-50"
        />
      </StatCardGrid>

      <DamagesFilters currentFilters={params} properties={properties || []} />

      <DamagesGrid damages={damages || []} total={count || 0} />
    </div>
  )
}
