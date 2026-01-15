'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, X } from 'lucide-react'
import { useState } from 'react'

interface CleaningsFiltersProps {
  currentFilters: {
    status?: string
    date?: string
    cleaner?: string
    property?: string
  }
  cleaners: Array<{
    id: string
    full_name: string | null
    email: string
  }>
  properties: Array<{
    id: string
    name: string
  }>
}

export default function CleaningsFilters({
  currentFilters,
  cleaners,
  properties,
}: CleaningsFiltersProps) {
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

    router.push(`/admin/limpiezas?${params.toString()}`)
  }

  const clearFilters = () => {
    setDate('')
    router.push('/admin/limpiezas')
  }

  const hasFilters =
    currentFilters.status ||
    currentFilters.date ||
    currentFilters.cleaner ||
    currentFilters.property

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Status Filter */}
        <select
          value={currentFilters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              handleFilterChange('date', e.target.value)
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Cleaner Filter */}
        <select
          value={currentFilters.cleaner || ''}
          onChange={(e) => handleFilterChange('cleaner', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las limpiadoras</option>
          {cleaners.map((cleaner) => (
            <option key={cleaner.id} value={cleaner.id}>
              {cleaner.full_name || cleaner.email}
            </option>
          ))}
        </select>

        {/* Property Filter */}
        <select
          value={currentFilters.property || ''}
          onChange={(e) => handleFilterChange('property', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}
