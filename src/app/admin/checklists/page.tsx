import { createClient } from '@/lib/supabase/server'
import { FileText, CheckSquare, BarChart } from 'lucide-react'
import ChecklistsTable from '@/components/admin/checklists/checklists-table'
import AddChecklist from '@/components/admin/checklists/add-checklist'
import { PageHeader, StatCard, StatCardGrid, Card } from '@/components/ui'

export default async function ChecklistsPage() {
  const supabase = await createClient()

  // Obtener templates de checklist
  const { data: checklists, count } = await supabase
    .from('checklist_templates')
    .select(
      `
      *,
      cleaning_type:cleaning_types(id, name)
    `,
      { count: 'exact' }
    )
    .order('name')

  // Obtener tipos de limpieza para el selector
  const { data: cleaningTypes } = await supabase
    .from('cleaning_types')
    .select('id, name')
    .order('name')

  // Calcular estadísticas
  const totalItems = checklists?.reduce((acc, checklist) => {
    const items = checklist.items as any[] || []
    return acc + items.length
  }, 0) || 0

  const avgItems = count ? Math.round(totalItems / count) : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates de Checklist"
        description="Gestiona las plantillas de tareas para cada tipo de limpieza"
        action={<AddChecklist cleaningTypes={cleaningTypes || []} />}
      />

      <StatCardGrid columns={3}>
        <StatCard
          title="Templates"
          value={count || 0}
          icon={FileText}
          variant="primary"
        />
        <StatCard
          title="Total Items"
          value={totalItems}
          icon={CheckSquare}
          variant="secondary"
        />
        <StatCard
          title="Promedio Items"
          value={avgItems}
          icon={BarChart}
          variant="accent3"
        />
      </StatCardGrid>

      <Card padding="none">
        <ChecklistsTable checklists={checklists || []} cleaningTypes={cleaningTypes || []} />
      </Card>
    </div>
  )
}
