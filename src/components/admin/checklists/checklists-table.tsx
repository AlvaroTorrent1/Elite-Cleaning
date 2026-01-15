'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Edit, Trash2, MoreVertical, Loader2, CheckSquare, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ChecklistItem {
  id: string
  name: string
  requires_photo: boolean
  order: number
}

interface ChecklistsTableProps {
  checklists: Array<{
    id: string
    name: string
    cleaning_type_id: string | null
    cleaning_type: { id: string; name: string } | null
    items: ChecklistItem[]
    created_at: string
  }>
  cleaningTypes: Array<{ id: string; name: string }>
}

export default function ChecklistsTable({ checklists, cleaningTypes }: ChecklistsTableProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleDelete = async (checklistId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este template de checklist?')) {
      return
    }

    setLoading(checklistId)
    try {
      const { error } = await supabase.from('checklist_templates').delete().eq('id', checklistId)

      if (error) throw error

      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(null)
      setOpenMenu(null)
    }
  }

  const getItemsArray = (items: any): ChecklistItem[] => {
    if (Array.isArray(items)) return items
    if (typeof items === 'object' && items !== null) {
      return Object.values(items)
    }
    return []
  }

  return (
    <div>
      {/* Table Header */}
      <div className="px-6 py-3 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-medium">{checklists.length}</span> templates de checklist
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo de Limpieza
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Con Foto
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {checklists.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No hay templates de checklist configurados
                </td>
              </tr>
            ) : (
              checklists.map((checklist) => {
                const items = getItemsArray(checklist.items)
                const itemsWithPhoto = items.filter((i) => i.requires_photo).length
                const isExpanded = expandedId === checklist.id

                return (
                  <>
                    <tr key={checklist.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : checklist.id)}
                          className="flex items-center gap-2 font-medium text-gray-900 hover:text-blue-600"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          {checklist.name}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        {checklist.cleaning_type ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                            {checklist.cleaning_type.name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Genérico</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <CheckSquare className="w-4 h-4" />
                          {items.length}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Camera className="w-4 h-4" />
                          {itemsWithPhoto}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenMenu(openMenu === checklist.id ? null : checklist.id)}
                            disabled={loading === checklist.id}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </button>

                          {openMenu === checklist.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenu(null)}
                              />
                              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                <Link
                                  href={`/admin/checklists/${checklist.id}`}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                                >
                                  <Edit className="w-4 h-4" />
                                  Editar
                                </Link>
                                <button
                                  onClick={() => handleDelete(checklist.id)}
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
                    {/* Expanded items */}
                    {isExpanded && items.length > 0 && (
                      <tr key={`${checklist.id}-items`}>
                        <td colSpan={5} className="px-6 py-4 bg-gray-50">
                          <div className="pl-8 space-y-2">
                            <p className="text-xs font-medium text-gray-500 uppercase mb-3">
                              Items del Checklist
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {items
                                .sort((a, b) => a.order - b.order)
                                .map((item, index) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200"
                                  >
                                    <span className="text-xs text-gray-400 w-5">{index + 1}.</span>
                                    <span className="flex-1 text-sm text-gray-700 truncate">
                                      {item.name}
                                    </span>
                                    {item.requires_photo && (
                                      <Camera className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
