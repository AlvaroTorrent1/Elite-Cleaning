import { createClient } from '@/lib/supabase/server'
import { History as HistoryIcon, Calendar, Download } from 'lucide-react'
import { CleaningStatusBadge } from '@/components/features/cleaning/cleaning-status-badge'

export default async function PMHistoricoPage() {
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
        <HistoryIcon className="w-12 h-12 text-[#E5E7EB] mx-auto mb-3" />
        <p className="text-[#6B7280]">No tienes propiedades asignadas</p>
      </div>
    )
  }

  // Obtener limpiezas de los últimos 30 días
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: cleanings, count } = await supabase
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
    .gte('scheduled_date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('scheduled_date', { ascending: false })

  // Calcular estadísticas
  const completedCount = cleanings?.filter((c) => c.status === 'completed').length || 0
  const cancelledCount = cleanings?.filter((c) => c.status === 'cancelled').length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <HistoryIcon className="w-6 h-6 text-[#1E40AF]" />
            <h1 className="text-2xl font-bold text-[#111827]">Histórico de Limpiezas</h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1E40AF] border border-[#1E40AF] hover:bg-[#F9FAFB] rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
        <p className="text-[#6B7280]">Limpiezas de los últimos 30 días</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-[#6B7280]">Total</p>
          <p className="text-2xl font-bold text-[#111827]">{count || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-[#6B7280]">Completadas</p>
          <p className="text-2xl font-bold text-[#10B981]">{completedCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-[#6B7280]">Canceladas</p>
          <p className="text-2xl font-bold text-[#EF4444]">{cancelledCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-[#6B7280]">Tasa Completado</p>
          <p className="text-2xl font-bold text-[#1E40AF]">
            {count && count > 0 ? Math.round((completedCount / count) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg border border-[#E5E7EB]">
        <div className="px-6 py-3 border-b border-[#E5E7EB]">
          <p className="text-sm text-[#6B7280]">
            Mostrando <span className="font-medium">{cleanings?.length || 0}</span> limpiezas
          </p>
        </div>

        <div className="divide-y divide-[#E5E7EB]">
          {!cleanings || cleanings.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#6B7280]">
              No hay limpiezas en el histórico
            </div>
          ) : (
            cleanings.map((cleaning) => (
              <div key={cleaning.id} className="px-6 py-4 hover:bg-[#F9FAFB]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Property */}
                    <div>
                      <p className="font-semibold text-[#111827]">
                        {cleaning.property?.name || 'Sin propiedad'}
                      </p>
                      <p className="text-sm text-[#6B7280]">{cleaning.property?.address}</p>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(cleaning.scheduled_date).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <span>
                        {cleaning.cleaning_type?.name || 'N/A'}
                      </span>
                      <span>
                        Por: {cleaning.cleaner?.full_name || 'Sin asignar'}
                      </span>
                      {cleaning.completed_at && (
                        <span className="text-[#10B981]">
                          ✓ Completada:{' '}
                          {new Date(cleaning.completed_at).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>

                    {/* Notes if any */}
                    {cleaning.notes && (
                      <p className="text-sm text-[#6B7280] italic">
                        Notas: {cleaning.notes}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <CleaningStatusBadge status={cleaning.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
