'use client'

import { MapPin, User, Calendar, Clock, ExternalLink, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { CleaningStatusBadge } from '@/components/features/cleaning/cleaning-status-badge'

interface CleaningsTableProps {
  cleanings: any[]
  total: number
}

export default function CleaningsTable({ cleanings, total }: CleaningsTableProps) {
  return (
    <div>
      {/* Table Header */}
      <div className="px-6 py-3 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-medium">{cleanings.length}</span> de{' '}
          <span className="font-medium">{total}</span> limpiezas
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
                Limpiadora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha/Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cleanings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No se encontraron limpiezas
                </td>
              </tr>
            ) : (
              cleanings.map((cleaning) => (
                <tr key={cleaning.id} className="hover:bg-gray-50">
                  {/* Property */}
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {cleaning.property?.name || 'Sin propiedad'}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {cleaning.property?.address}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Cleaner */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {cleaning.cleaner?.full_name || 'Sin asignar'}
                      </span>
                    </div>
                  </td>

                  {/* Date/Time */}
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">
                          {new Date(cleaning.scheduled_date).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {cleaning.scheduled_time?.slice(0, 5) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-gray-900">
                        {cleaning.cleaning_type?.name || 'N/A'}
                      </span>
                      {cleaning.is_urgent && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          Urgente
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <CleaningStatusBadge status={cleaning.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/limpiezas/${cleaning.id}`}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver
                    </Link>
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
