import { createClient } from '@/lib/supabase/server'
import { Home, Calendar, AlertTriangle, Package, Plus } from 'lucide-react'
import Link from 'next/link'
import PropertyCard from '@/components/pm/property-card'
import { StatCard, StatCardGrid, Card } from '@/components/ui'

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
      {/* Stats - Usando paleta corporativa */}
      <StatCardGrid columns={4}>
        <StatCard
          title="Propiedades"
          value={properties?.length || 0}
          icon={Home}
          variant="primary"
        />
        <StatCard
          title="Limpiezas Próximas"
          value={upcomingCleanings || 0}
          icon={Calendar}
          variant="secondary"
        />
        <StatCard
          title="Daños Pendientes"
          value={pendingDamages || 0}
          icon={AlertTriangle}
          variant="accent5"
        />
        <StatCard
          title="Objetos Perdidos"
          value={lostItems || 0}
          icon={Package}
          variant="accent4"
        />
      </StatCardGrid>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-foreground mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/pm/nueva-limpieza"
            className="flex items-center gap-3 p-4 border-2 border-primary bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
          >
            <Plus className="w-6 h-6" />
            <div>
              <p className="font-semibold">Solicitar Limpieza</p>
              <p className="text-sm opacity-90">Crear nueva limpieza manual</p>
            </div>
          </Link>

          <Link
            href="/pm/limpiezas"
            className="flex items-center gap-3 p-4 border-2 border-border hover:border-secondary hover:bg-secondary/5 rounded-lg transition-colors"
          >
            <Calendar className="w-6 h-6 text-secondary" />
            <div>
              <p className="font-semibold text-foreground">Ver Limpiezas</p>
              <p className="text-sm text-muted-foreground">Próximas y en curso</p>
            </div>
          </Link>

          <Link
            href="/pm/danos"
            className="flex items-center gap-3 p-4 border-2 border-border hover:border-primary hover:bg-primary/5 rounded-lg transition-colors"
          >
            <AlertTriangle className="w-6 h-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Ver Daños</p>
              <p className="text-sm text-muted-foreground">Reportes pendientes</p>
            </div>
          </Link>
        </div>
      </Card>

      {/* Properties List */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Mis Propiedades</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{properties?.length || 0} propiedades</span>
            <Link href="/pm/nueva-propiedad">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
                Nueva
              </button>
            </Link>
          </div>
        </div>

        {!properties || properties.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted-foreground">No tienes propiedades asignadas aún</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Añade tu primera propiedad para empezar
            </p>
            <Link href="/pm/nueva-propiedad">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
                Añadir Propiedad
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
