import { createClient } from '@/lib/supabase/server'
import { Calendar as CalendarIcon } from 'lucide-react'
import PMCleaningsFilters from '@/components/pm/cleanings/pm-cleanings-filters'
import PMCleaningsList from '@/components/pm/cleanings/pm-cleanings-list'

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
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-12 text-center">
        <CalendarIcon className="w-12 h-12 text-[#E5E7EB] mx-auto mb-3" />
        <p className="text-[#6B7280]">No tienes propiedades asignadas</p>
      </div>
    )
  }

  // Construir query con filtros
  let query = supabase
    .from('cleanings')
    .select(
      `
      *,
      property:properties(id, name, address),
      cleaner:profiles!cleanings_assigned_to_fkey(id, full_name),
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Limpiezas Programadas</h1>
        <p className="text-[#6B7280]">Gestiona las limpiezas de tus propiedades</p>
      </div>

      {/* Filters */}
      <PMCleaningsFilters currentFilters={params} properties={properties || []} />

      {/* List */}
      <div className="bg-white rounded-lg border border-[#E5E7EB]">
        <PMCleaningsList cleanings={cleanings || []} total={count || 0} />
      </div>
    </div>
  )
}
