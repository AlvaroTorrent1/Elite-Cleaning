'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'

interface DamagesFiltersProps {
  currentFilters: {
    status?: string
    property?: string
  }
  properties: Array<{
    id: string
    name: string
  }>
}

export default function DamagesFilters({ currentFilters, properties }: DamagesFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/admin/danos?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/admin/danos')
  }

  const hasFilters = currentFilters.status || currentFilters.property

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Status Filter */}
        <select
          value={currentFilters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente de revisión</option>
          <option value="reviewed">Revisado</option>
        </select>

        {/* Property Filter */}
        <select
          value={currentFilters.property || ''}
          onChange={(e) => handleFilterChange('property', e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las propiedades</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}
