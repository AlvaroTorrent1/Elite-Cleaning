'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useState } from 'react'

interface UsersFiltersProps {
  currentFilters: {
    role?: string
    status?: string
    search?: string
  }
}

export default function UsersFilters({ currentFilters }: UsersFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentFilters.search || '')

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    router.push(`/admin/usuarios?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    handleFilterChange('search', search)
  }

  const clearFilters = () => {
    setSearch('')
    router.push('/admin/usuarios')
  }

  const hasFilters = currentFilters.role || currentFilters.status || currentFilters.search

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Role Filter */}
        <select
          value={currentFilters.role || ''}
          onChange={(e) => handleFilterChange('role', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los roles</option>
          <option value="admin">Administradores</option>
          <option value="cleaner">Limpiadoras</option>
          <option value="property_manager">Property Managers</option>
        </select>

        {/* Status Filter */}
        <select
          value={currentFilters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
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
