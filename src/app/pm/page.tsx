import { createClient } from '@/lib/supabase/server'
import { Home, Calendar, AlertTriangle, Package, Plus } from 'lucide-react'
import Link from 'next/link'
import PropertyCard from '@/components/pm/property-card'

export default async function PMDashboard() {
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
    .select('*')
    .eq('property_manager_id', user.id)
    .order('name')

  // Obtener estadísticas de limpiezas
  const { count: upcomingCleanings } = await supabase
    .from('cleanings')
    .select('*', { count: 'exact', head: true })
    .in('property_id', properties?.map((p) => p.id) || [])
    .in('status', ['pending', 'assigned', 'in_progress'])
    .gte('scheduled_date', new Date().toISOString().split('T')[0])

  // Daños pendientes
  const { count: pendingDamages } = await supabase
    .from('damage_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
    .in(
      'cleaning_id',
      (
        await supabase
          .from('cleanings')
          .select('id')
          .in('property_id', properties?.map((p) => p.id) || [])
      ).data?.map((c) => c.id) || []
    )

  // Objetos perdidos sin revisar
  const { count: lostItems } = await supabase
    .from('cleaning_images')
    .select('*', { count: 'exact', head: true })
    .eq('category', 'lost_item')
    .in(
      'cleaning_id',
      (
        await supabase
          .from('cleanings')
          .select('id')
          .in('property_id', properties?.map((p) => p.id) || [])
      ).data?.map((c) => c.id) || []
    )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Propiedades</p>
              <p className="text-2xl font-bold text-[#1E40AF]">{properties?.length || 0}</p>
            </div>
            <Home className="w-8 h-8 text-[#3B82F6]" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Limpiezas Próximas</p>
              <p className="text-2xl font-bold text-[#10B981]">{upcomingCleanings || 0}</p>
            </div>
            <Calendar className="w-8 h-8 text-[#10B981]" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Daños Pendientes</p>
              <p className="text-2xl font-bold text-[#EF4444]">{pendingDamages || 0}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-[#EF4444]" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Objetos Perdidos</p>
              <p className="text-2xl font-bold text-[#F59E0B]">{lostItems || 0}</p>
            </div>
            <Package className="w-8 h-8 text-[#F59E0B]" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/pm/nueva-limpieza"
            className="flex items-center gap-3 p-4 border-2 border-[#1E40AF] bg-[#1E40AF] hover:bg-[#1E3A8A] text-white rounded-lg transition-colors"
          >
            <Plus className="w-6 h-6" />
            <div>
              <p className="font-semibold">Solicitar Limpieza</p>
              <p className="text-sm opacity-90">Crear nueva limpieza manual</p>
            </div>
          </Link>

          <Link
            href="/pm/limpiezas"
            className="flex items-center gap-3 p-4 border-2 border-[#E5E7EB] hover:border-[#1E40AF] hover:bg-[#F9FAFB] rounded-lg transition-colors"
          >
            <Calendar className="w-6 h-6 text-[#1E40AF]" />
            <div>
              <p className="font-semibold text-[#111827]">Ver Limpiezas</p>
              <p className="text-sm text-[#6B7280]">Próximas y en curso</p>
            </div>
          </Link>

          <Link
            href="/pm/danos"
            className="flex items-center gap-3 p-4 border-2 border-[#E5E7EB] hover:border-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
          >
            <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
            <div>
              <p className="font-semibold text-[#111827]">Ver Daños</p>
              <p className="text-sm text-[#6B7280]">Reportes pendientes</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Properties List */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#111827]">Mis Propiedades</h2>
          <span className="text-sm text-[#6B7280]">{properties?.length || 0} propiedades</span>
        </div>

        {!properties || properties.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-12 h-12 text-[#E5E7EB] mx-auto mb-3" />
            <p className="text-[#6B7280]">No tienes propiedades asignadas aún</p>
            <p className="text-sm text-[#6B7280] mt-1">
              Contacta con el administrador para que te asigne propiedades
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
