'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, X } from 'lucide-react'
import { useState } from 'react'

interface PMCleaningsFiltersProps {
  currentFilters: {
    status?: string
    date?: string
    property?: string
  }
  properties: Array<{
    id: string
    name: string
  }>
}

export default function PMCleaningsFilters({
  currentFilters,
  properties,
}: PMCleaningsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [date, setDate] = useState(currentFilters.date || '')

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/pm/limpiezas?${params.toString()}`)
  }

  const clearFilters = () => {
    setDate('')
    router.push('/pm/limpiezas')
  }

  const hasFilters = currentFilters.status || currentFilters.date || currentFilters.property

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <select
          value={currentFilters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-[#111827]"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="assigned">Asignada</option>
          <option value="in_progress">En Curso</option>
          <option value="completed">Completada</option>
          <option value="cancelled">Cancelada</option>
        </select>

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" />
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              handleFilterChange('date', e.target.value)
            }}
            className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-[#111827]"
          />
        </div>

        {/* Property Filter */}
        <select
          value={currentFilters.property || ''}
          onChange={(e) => handleFilterChange('property', e.target.value)}
          className="px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-[#111827]"
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
            className="flex items-center justify-center gap-2 px-4 py-2 text-[#6B7280] bg-[#F9FAFB] hover:bg-[#E5E7EB] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}
