'use client'

import { useState } from 'react'
import { MapPin, Bed, Bath, MoreVertical, Edit, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface PropertiesTableProps {
  properties: any[]
  total: number
}

export default function PropertiesTable({ properties, total }: PropertiesTableProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const handleDelete = async (propertyId: string) => {
    if (
      !confirm(
        '¿Estás seguro de que quieres eliminar esta propiedad?\n\nSe eliminarán también todas las limpiezas asociadas.'
      )
    ) {
      return
    }

    setLoading(propertyId)
    try {
      const { error } = await supabase.from('properties').delete().eq('id', propertyId)

      if (error) throw error

      router.refresh()
      alert('✅ Propiedad eliminada correctamente')
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al eliminar propiedad')
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
          Mostrando <span className="font-medium">{properties.length}</span> de{' '}
          <span className="font-medium">{total}</span> propiedades
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propiedad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detalles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                iCal
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No se encontraron propiedades
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  {/* Property Name */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{property.name}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {property.access_instructions || 'Sin instrucciones'}
                      </p>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-gray-900">{property.address}</p>
                        <p className="text-gray-500">
                          {property.city} {property.postal_code}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Details */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>{property.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>{property.bathrooms}</span>
                      </div>
                    </div>
                  </td>

                  {/* iCal Status */}
                  <td className="px-6 py-4">
                    {property.ical_airbnb || property.ical_booking || property.ical_other ? (
                      <div className="flex flex-wrap gap-1">
                        {property.ical_airbnb && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-pink-100 text-pink-700">
                            Airbnb
                          </span>
                        )}
                        {property.ical_booking && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                            Booking
                          </span>
                        )}
                        {property.ical_other && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                            Otro
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                        Sin conectar
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenMenu(openMenu === property.id ? null : property.id)}
                        disabled={loading === property.id}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>

                      {openMenu === property.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenu(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                            <Link
                              href={`/admin/propiedades/${property.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </Link>
                            <button
                              onClick={() => handleDelete(property.id)}
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
