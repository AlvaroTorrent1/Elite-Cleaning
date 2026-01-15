import { createClient } from '@/lib/supabase/server'
import StatsCards from '@/components/admin/dashboard/stats-cards'
import RecentCleanings from '@/components/admin/dashboard/recent-cleanings'
import RecentReports from '@/components/admin/dashboard/recent-reports'
import CleaningsChart from '@/components/admin/dashboard/cleanings-chart'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Obtener estadísticas generales
  const [
    { count: totalProperties },
    { count: totalUsers },
    { count: totalCleanings },
    { count: pendingCleanings },
    { count: completedToday },
    { count: pendingApprovals },
    { count: unresolvedDamages },
  ] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('cleanings').select('*', { count: 'exact', head: true }),
    supabase
      .from('cleanings')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'assigned']),
    supabase
      .from('cleanings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('completed_at', new Date().toISOString().split('T')[0]),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'property_manager')
      .eq('is_approved', false),
    supabase
      .from('damage_reports')
      .select('*', { count: 'exact', head: true })
      .eq('acknowledged_by_admin', false),
  ])

  // Obtener limpiezas recientes
  const { data: recentCleanings } = await supabase
    .from('cleanings')
    .select(`
      *,
      property:properties(name, address),
      cleaner:profiles!cleanings_cleaner_id_fkey(full_name),
      cleaning_type:cleaning_types(name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Obtener reportes recientes
  const { data: recentDamages } = await supabase
    .from('damage_reports')
    .select(`
      *,
      cleaning:cleanings(
        property:properties(name)
      ),
      damage_item:damage_catalog(name, estimated_price)
    `)
    .eq('acknowledged_by_admin', false)
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = {
    totalProperties: totalProperties || 0,
    totalUsers: totalUsers || 0,
    totalCleanings: totalCleanings || 0,
    pendingCleanings: pendingCleanings || 0,
    completedToday: completedToday || 0,
    pendingApprovals: pendingApprovals || 0,
    unresolvedDamages: unresolvedDamages || 0,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Visión general del sistema de gestión de limpiezas
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts */}
      <CleaningsChart />

      {/* Two columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cleanings */}
        <RecentCleanings cleanings={recentCleanings || []} />

        {/* Recent Reports */}
        <RecentReports damages={recentDamages || []} />
      </div>
    </div>
  )
}
