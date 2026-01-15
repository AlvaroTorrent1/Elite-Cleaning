import { createClient } from '@/lib/supabase/server'
import { AlertTriangle } from 'lucide-react'
import DamageReportCard from '@/components/pm/reports/damage-report-card'

export default async function PMDanosPage() {
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
        <AlertTriangle className="w-12 h-12 text-[#E5E7EB] mx-auto mb-3" />
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

  // Obtener reportes de daños
  const { data: damageReports } = await supabase
    .from('damage_reports')
    .select(
      `
      *,
      cleaning:cleanings!inner(
        id,
        scheduled_date,
        property:properties(id, name, address)
      ),
      damage_item:damage_catalog(name, category, estimated_price),
      reporter:profiles!damage_reports_reported_by_fkey(full_name)
    `
    )
    .in('cleaning_id', cleaningIds)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
          <h1 className="text-2xl font-bold text-[#111827]">Reportes de Daños</h1>
        </div>
        <p className="text-[#6B7280]">Daños reportados por el equipo de limpieza</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-[#6B7280]">Total Reportes</p>
          <p className="text-2xl font-bold text-[#111827]">{damageReports?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-[#6B7280]">Pendientes</p>
          <p className="text-2xl font-bold text-[#EF4444]">
            {damageReports?.filter((r) => !r.acknowledged_by_pm).length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-[#6B7280]">Costo Estimado</p>
          <p className="text-2xl font-bold text-[#111827]">
            €
            {damageReports
              ?.reduce((sum, r) => sum + parseFloat(r.estimated_cost || '0'), 0)
              .toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {!damageReports || damageReports.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-[#E5E7EB] mx-auto mb-3" />
            <p className="text-[#6B7280]">No hay reportes de daños</p>
          </div>
        ) : (
          damageReports.map((report) => (
            <DamageReportCard key={report.id} report={report} />
          ))
        )}
      </div>
    </div>
  )
}
