import { createClient } from '@/lib/supabase/server'
import { Clock, ClipboardList } from 'lucide-react'
import CleaningTypesTable from '@/components/admin/cleaning-types/cleaning-types-table'
import AddCleaningType from '@/components/admin/cleaning-types/add-cleaning-type'
import { PageHeader, StatCard, StatCardGrid, Card } from '@/components/ui'

export default async function CleaningTypesPage() {
  const supabase = await createClient()

  // Obtener tipos de limpieza
  const { data: cleaningTypes, count } = await supabase
    .from('cleaning_types')
    .select('*', { count: 'exact' })
    .order('name')

  // Contar limpiezas por tipo
  const { data: cleaningsCount } = await supabase
    .from('cleanings')
    .select('cleaning_type_id')

  const countByType = cleaningTypes?.map((type) => ({
    ...type,
    cleanings_count: cleaningsCount?.filter((c) => c.cleaning_type_id === type.id).length || 0,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tipos de Limpieza"
        description="Gestiona los diferentes tipos de limpieza disponibles"
        action={<AddCleaningType />}
      />

      <StatCardGrid columns={3}>
        <StatCard
          title="Total Tipos"
          value={count || 0}
          icon={ClipboardList}
          iconColor="text-gray-600"
          iconBgColor="bg-gray-50"
        />
        {cleaningTypes?.map((type) => (
          <StatCard
            key={type.id}
            title={type.name}
            value={countByType?.find((t) => t.id === type.id)?.cleanings_count || 0}
            subtitle={
              type.estimated_duration_minutes
                ? `${type.estimated_duration_minutes} min`
                : undefined
            }
            icon={Clock}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
          />
        ))}
      </StatCardGrid>

      <Card padding="none">
        <CleaningTypesTable cleaningTypes={countByType || []} />
      </Card>
    </div>
  )
}
