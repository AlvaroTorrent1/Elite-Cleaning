import { createClient } from '@/lib/supabase/server'
import { Calendar, CheckCircle, Clock, PlayCircle } from 'lucide-react'
import CleaningsFilters from '@/components/admin/cleanings/cleanings-filters'
import CleaningsTable from '@/components/admin/cleanings/cleanings-table'
import { PageHeader, StatCard, StatCardGrid, Card } from '@/components/ui'

export default async function CleaningsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
    date?: string
    cleaner?: string
    property?: string
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Construir query con filtros
  let query = supabase
    .from('cleanings')
    .select(
      `
      *,
      property:properties(id, name, address, city),
      cleaner:profiles!cleanings_cleaner_id_fkey(id, full_name),
      cleaning_type:cleaning_types(name)
    `,
      { count: 'exact' }
    )

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.date) {
    query = query.eq('scheduled_date', params.date)
  }

  if (params.cleaner) {
    query = query.eq('cleaner_id', params.cleaner)
  }

  if (params.property) {
    query = query.eq('property_id', params.property)
  }

  const { data: cleanings, count } = await query.order('scheduled_date', {
    ascending: false,
  })

  // Obtener estadísticas
  const [
    { count: totalCleanings },
    { count: pendingCleanings },
    { count: inProgressCleanings },
    { count: completedCleanings },
  ] = await Promise.all([
    supabase.from('cleanings').select('*', { count: 'exact', head: true }),
    supabase
      .from('cleanings')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'assigned']),
    supabase
      .from('cleanings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress'),
    supabase
      .from('cleanings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed'),
  ])

  // Obtener lista de limpiadoras y propiedades para filtros
  const [{ data: cleaners }, { data: properties }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'cleaner')
      .eq('is_active', true)
      .order('full_name'),
    supabase.from('properties').select('id, name').order('name'),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Limpiezas"
        description="Visualiza y administra todas las limpiezas del sistema"
      />

      <StatCardGrid columns={4}>
        <StatCard
          title="Total"
          value={totalCleanings || 0}
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="Pendientes"
          value={pendingCleanings || 0}
          icon={Clock}
          variant="accent2"
        />
        <StatCard
          title="En Curso"
          value={inProgressCleanings || 0}
          icon={PlayCircle}
          variant="secondary"
        />
        <StatCard
          title="Completadas"
          value={completedCleanings || 0}
          icon={CheckCircle}
          variant="accent3"
        />
      </StatCardGrid>

      <CleaningsFilters
        currentFilters={params}
        cleaners={cleaners || []}
        properties={properties || []}
      />

      <Card padding="none">
        <CleaningsTable cleanings={cleanings || []} total={count || 0} />
      </Card>
    </div>
  )
}
