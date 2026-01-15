import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Building, MapPin, Link2, LinkIcon } from 'lucide-react'
import PropertiesTable from '@/components/admin/properties/properties-table'
import PropertiesFilters from '@/components/admin/properties/properties-filters'
import { PageHeader, Button, StatCard, StatCardGrid, Card } from '@/components/ui'

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; city?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Construir query con filtros
  let query = supabase.from('properties').select('*', { count: 'exact' })

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,address.ilike.%${params.search}%`)
  }

  if (params.city) {
    query = query.eq('city', params.city)
  }

  const { data: properties, count } = await query.order('created_at', {
    ascending: false,
  })

  // Obtener estadísticas
  const { count: totalProperties } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })

  // Obtener ciudades únicas para el filtro
  const { data: cities } = await supabase
    .from('properties')
    .select('city')
    .not('city', 'is', null)

  const uniqueCities = [...new Set(cities?.map((p) => p.city).filter(Boolean))] as string[]

  const withIcal = properties?.filter((p) => p.ical_airbnb || p.ical_booking || p.ical_other).length || 0
  const withoutIcal = properties?.filter((p) => !p.ical_airbnb && !p.ical_booking && !p.ical_other).length || 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Propiedades"
        description="Administra las propiedades de alquiler turístico"
        action={
          <Link href="/admin/propiedades/nueva">
            <Button leftIcon={<Plus className="w-5 h-5" />}>Nueva Propiedad</Button>
          </Link>
        }
      />

      <StatCardGrid columns={4}>
        <StatCard
          title="Total Propiedades"
          value={totalProperties || 0}
          icon={Building}
          iconColor="text-gray-600"
          iconBgColor="bg-gray-50"
        />
        <StatCard
          title="Ciudades"
          value={uniqueCities.length}
          icon={MapPin}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />
        <StatCard
          title="Con iCal"
          value={withIcal}
          icon={Link2}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
        />
        <StatCard
          title="Sin iCal"
          value={withoutIcal}
          icon={LinkIcon}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-50"
        />
      </StatCardGrid>

      <PropertiesFilters currentFilters={params} cities={uniqueCities} />

      <Card padding="none">
        <PropertiesTable properties={properties || []} total={count || 0} />
      </Card>
    </div>
  )
}
