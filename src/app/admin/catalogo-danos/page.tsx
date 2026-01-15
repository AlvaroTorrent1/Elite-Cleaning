import { createClient } from '@/lib/supabase/server'
import { Package, FolderOpen, ArrowDown, ArrowUp } from 'lucide-react'
import CatalogTable from '@/components/admin/catalog/catalog-table'
import AddCatalogItem from '@/components/admin/catalog/add-catalog-item'
import { PageHeader, StatCard, StatCardGrid, Card } from '@/components/ui'

export default async function CatalogPage() {
  const supabase = await createClient()

  // Obtener items del catálogo
  const { data: catalogItems, count } = await supabase
    .from('damage_catalog')
    .select('*', { count: 'exact' })
    .order('category')
    .order('name')

  // Obtener categorías únicas
  const categories = [
    ...new Set(catalogItems?.map((item) => item.category).filter(Boolean)),
  ] as string[]

  const minPrice = catalogItems && catalogItems.length > 0
    ? Math.min(...catalogItems.map((i) => i.estimated_price))
    : 0

  const maxPrice = catalogItems && catalogItems.length > 0
    ? Math.max(...catalogItems.map((i) => i.estimated_price))
    : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogo de Daños"
        description="Gestiona los items y precios del catálogo de daños"
        action={<AddCatalogItem />}
      />

      <StatCardGrid columns={4}>
        <StatCard
          title="Total Items"
          value={count || 0}
          icon={Package}
          variant="primary"
        />
        <StatCard
          title="Categorías"
          value={categories.length}
          icon={FolderOpen}
          variant="secondary"
        />
        <StatCard
          title="Precio Mínimo"
          value={`€${minPrice.toFixed(2)}`}
          icon={ArrowDown}
          variant="accent3"
        />
        <StatCard
          title="Precio Máximo"
          value={`€${maxPrice.toFixed(2)}`}
          icon={ArrowUp}
          variant="accent5"
        />
      </StatCardGrid>

      <Card padding="none">
        <CatalogTable items={catalogItems || []} categories={categories} />
      </Card>
    </div>
  )
}
