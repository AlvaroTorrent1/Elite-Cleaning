import { createClient } from '@/lib/supabase/server'
import { Package } from 'lucide-react'
import LostItemCard from '@/components/pm/reports/lost-item-card'

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
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-12 text-center">
        <Package className="w-12 h-12 text-[#E5E7EB] mx-auto mb-3" />
        <p className="text-[#6B7280]">No tienes propiedades asignadas</p>
      </div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-6 h-6 text-[#F59E0B]" />
          <h1 className="text-2xl font-bold text-[#111827]">Objetos Perdidos</h1>
        </div>
        <p className="text-[#6B7280]">
          Objetos encontrados por el equipo de limpieza
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-[#6B7280]">Total Reportes</p>
          <p className="text-2xl font-bold text-[#111827]">
            {lostItemReports?.length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-[#6B7280]">Sin Revisar</p>
          <p className="text-2xl font-bold text-[#F59E0B]">
            {lostItemReports?.filter((r) => !r.acknowledged_by_pm).length || 0}
          </p>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {!lostItemReports || lostItemReports.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-12 text-center">
            <Package className="w-12 h-12 text-[#E5E7EB] mx-auto mb-3" />
            <p className="text-[#6B7280]">No hay reportes de objetos perdidos</p>
          </div>
        ) : (
          lostItemReports.map((report) => <LostItemCard key={report.id} report={report} />)
        )}
      </div>
    </div>
  )
}
