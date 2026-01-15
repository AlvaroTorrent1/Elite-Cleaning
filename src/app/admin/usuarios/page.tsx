import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import UsersTable from '@/components/admin/users/users-table'
import UsersFilters from '@/components/admin/users/users-filters'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; status?: string; search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Construir query con filtros
  let query = supabase.from('profiles').select('*', { count: 'exact' })

  if (params.role) {
    query = query.eq('role', params.role)
  }

  if (params.status === 'active') {
    query = query.eq('is_active', true)
  } else if (params.status === 'inactive') {
    query = query.eq('is_active', false)
  }

  if (params.search) {
    query = query.or(
      `full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`
    )
  }

  const { data: users, count } = await query.order('created_at', {
    ascending: false,
  })

  // Obtener contadores por rol
  const [
    { count: totalUsers },
    { count: admins },
    { count: cleaners },
    { count: pms },
    { count: pendingApprovals },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'cleaner'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'property_manager'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'property_manager')
      .eq('is_approved', false),
  ])

  const stats = {
    total: totalUsers || 0,
    admins: admins || 0,
    cleaners: cleaners || 0,
    pms: pms || 0,
    pendingApprovals: pendingApprovals || 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">
            Administra limpiadoras, property managers y administradores
          </p>
        </div>
        <Link
          href="/admin/usuarios/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Usuarios</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Administradores</p>
          <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Limpiadoras</p>
          <p className="text-2xl font-bold text-blue-600">{stats.cleaners}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Property Managers</p>
          <p className="text-2xl font-bold text-green-600">{stats.pms}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Pendientes Aprobación</p>
          <p className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</p>
        </div>
      </div>

      {/* Filters */}
      <UsersFilters currentFilters={params} />

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <UsersTable users={users || []} total={count || 0} />
      </div>
    </div>
  )
}
