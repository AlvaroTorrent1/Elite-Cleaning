import { createClient } from '@/lib/supabase/server'
import { Package, Clock, CheckCircle } from 'lucide-react'
import LostItemsGrid from '@/components/admin/lost-items/lost-items-grid'
import { PageHeader, StatCard, StatCardGrid, Card, Button } from '@/components/ui'

export default async function LostItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Construir query con filtros
  let query = supabase
    .from('lost_item_reports')
    .select(
      `
      *,
      cleaning:cleanings(
        id,
        scheduled_date,
        property:properties(name, address)
      ),
      reporter:profiles!lost_item_reports_reported_by_fkey(full_name)
    `,
      { count: 'exact' }
    )

  // Filtrar por estado
  if (params.status === 'pending') {
    query = query.eq('acknowledged_by_admin', false)
  } else if (params.status === 'reviewed') {
    query = query.eq('acknowledged_by_admin', true)
  }

  const { data: lostItems, count } = await query.order('created_at', { ascending: false })

  // Obtener estadísticas
  const [
    { count: totalItems },
    { count: pendingItems },
    { count: reviewedItems },
  ] = await Promise.all([
    supabase.from('lost_item_reports').select('*', { count: 'exact', head: true }),
    supabase
      .from('lost_item_reports')
      .select('*', { count: 'exact', head: true })
      .eq('acknowledged_by_admin', false),
    supabase
      .from('lost_item_reports')
      .select('*', { count: 'exact', head: true })
      .eq('acknowledged_by_admin', true),
  ])

  const filterButtons = [
    { label: 'Todos', href: '/admin/objetos-perdidos', active: !params.status },
    { label: 'Pendientes', href: '/admin/objetos-perdidos?status=pending', active: params.status === 'pending' },
    { label: 'Revisados', href: '/admin/objetos-perdidos?status=reviewed', active: params.status === 'reviewed' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Objetos Perdidos"
        description="Revisa los objetos olvidados encontrados en las propiedades"
      />

      <StatCardGrid columns={3}>
        <StatCard
          title="Total"
          value={totalItems || 0}
          icon={Package}
          variant="primary"
        />
        <StatCard
          title="Pendientes"
          value={pendingItems || 0}
          icon={Clock}
          variant="accent4"
        />
        <StatCard
          title="Revisados"
          value={reviewedItems || 0}
          icon={CheckCircle}
          variant="accent3"
        />
      </StatCardGrid>

      {/* Filters */}
      <Card>
        <div className="flex gap-2">
          {filterButtons.map((btn) => (
            <a key={btn.href} href={btn.href}>
              <Button variant={btn.active ? 'primary' : 'muted'} size="sm">
                {btn.label}
              </Button>
            </a>
          ))}
        </div>
      </Card>

      <LostItemsGrid lostItems={lostItems || []} total={count || 0} />
    </div>
  )
}
