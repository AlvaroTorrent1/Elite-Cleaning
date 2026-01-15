'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, X } from 'lucide-react'
import { useState } from 'react'
import { Card, Select, Button } from '@/components/ui'

/**
 * PMCleaningsFilters - Filtros de limpiezas para PM
 * 
 * Usa la paleta corporativa rosa/lila
 */

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

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'assigned', label: 'Asignada' },
    { value: 'in_progress', label: 'En Curso' },
    { value: 'completed', label: 'Completada' },
    { value: 'cancelled', label: 'Cancelada' },
  ]

  const propertyOptions = [
    { value: '', label: 'Todas las propiedades' },
    ...properties.map((p) => ({ value: p.id, label: p.name })),
  ]

  return (
    <Card>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <Select
          value={currentFilters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          options={statusOptions}
        />

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              handleFilterChange('date', e.target.value)
            }}
            className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-colors"
          />
        </div>

        {/* Property Filter */}
        <Select
          value={currentFilters.property || ''}
          onChange={(e) => handleFilterChange('property', e.target.value)}
          options={propertyOptions}
        />

        {/* Clear Filters */}
        {hasFilters && (
          <Button
            onClick={clearFilters}
            variant="muted"
            leftIcon={<X className="w-4 h-4" />}
          >
            Limpiar
          </Button>
        )}
      </div>
    </Card>
  )
}
