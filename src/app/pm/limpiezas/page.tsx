import { createClient } from '@/lib/supabase/server'
import { Calendar as CalendarIcon } from 'lucide-react'
import PMCleaningsFilters from '@/components/pm/cleanings/pm-cleanings-filters'
import PMCleaningsList from '@/components/pm/cleanings/pm-cleanings-list'
import { PageHeader, Card, EmptyState } from '@/components/ui'

export default async function PMCleaningsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; date?: string; property?: string }>
}) {
  const params = await searchParams
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
    .select('id, name')
    .eq('property_manager_id', user.id)
    .order('name')

  const propertyIds = properties?.map((p) => p.id) || []

  if (propertyIds.length === 0) {
    return (
      <Card className="text-center py-12">
        <EmptyState
          icon={CalendarIcon}
          title="No tienes propiedades asignadas"
          description="Contacta con el administrador para que te asigne propiedades"
        />
      </Card>
    )
  }

  // Construir query con filtros
  let query = supabase
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

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.date) {
    query = query.eq('scheduled_date', params.date)
  }

  if (params.property) {
    query = query.eq('property_id', params.property)
  }

  const { data: cleanings, count } = await query.order('scheduled_date', {
    ascending: true,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Limpiezas Programadas"
        description="Gestiona las limpiezas de tus propiedades"
      />

      {/* Filters */}
      <PMCleaningsFilters currentFilters={params} properties={properties || []} />

      {/* List */}
      <Card padding="none">
        <PMCleaningsList cleanings={cleanings || []} total={count || 0} />
      </Card>
    </div>
  )
}
