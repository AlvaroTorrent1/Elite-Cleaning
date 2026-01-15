'use client'

import { useState } from 'react'
import { Mail, Phone, MoreVertical, Edit, Trash2, Check, X, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface UsersTableProps {
  users: any[]
  total: number
}

export default function UsersTable({ users, total }: UsersTableProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const getRoleBadge = (role: string) => {
    const config = {
      admin: { label: 'Admin', class: 'bg-purple-100 text-purple-700' },
      cleaner: { label: 'Limpiadora', class: 'bg-blue-100 text-blue-700' },
      property_manager: { label: 'Property Manager', class: 'bg-green-100 text-green-700' },
    }[role] || { label: role, class: 'bg-gray-100 text-gray-700' }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    )
  }

  const handleApprove = async (userId: string) => {
    setLoading(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', userId)

      if (error) throw error
      
      router.refresh()
      alert('✅ Usuario aprobado correctamente')
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al aprobar usuario')
    } finally {
      setLoading(null)
      setOpenMenu(null)
    }
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    setLoading(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId)

      if (error) throw error
      
      router.refresh()
      alert(`✅ Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente`)
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al cambiar estado del usuario')
    } finally {
      setLoading(null)
      setOpenMenu(null)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      return
    }

    setLoading(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error
      
      router.refresh()
      alert('✅ Usuario eliminado correctamente')
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al eliminar usuario')
    } finally {
      setLoading(null)
      setOpenMenu(null)
    }
  }

  return (
    <div>
      {/* Table Header */}
      <div className="px-6 py-3 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-medium">{users.length}</span> de{' '}
          <span className="font-medium">{total}</span> usuarios
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registro
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  {/* User Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.full_name || 'Sin nombre'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    {getRoleBadge(user.role)}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full w-fit ${
                          user.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.is_active ? (
                          <>
                            <Check className="w-3 h-3" />
                            Activo
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" />
                            Inactivo
                          </>
                        )}
                      </span>
                      {user.role === 'property_manager' && !user.is_approved && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 w-fit">
                          <UserCheck className="w-3 h-3" />
                          Pendiente
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Registration Date */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                        disabled={loading === user.id}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>

                      {openMenu === user.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenu(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                            {user.role === 'property_manager' && !user.is_approved && (
                              <button
                                onClick={() => handleApprove(user.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50 rounded-t-lg"
                              >
                                <UserCheck className="w-4 h-4" />
                                Aprobar
                              </button>
                            )}
                            <Link
                              href={`/admin/usuarios/${user.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </Link>
                            <button
                              onClick={() => handleToggleActive(user.id, user.is_active)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              {user.is_active ? (
                                <>
                                  <X className="w-4 h-4" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4" />
                                  Activar
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
