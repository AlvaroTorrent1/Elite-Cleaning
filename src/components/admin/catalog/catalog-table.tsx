'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Badge,
  Select,
  DropdownMenu,
  DropdownMenuItem,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyRow,
} from '@/components/ui'

interface CatalogTableProps {
  items: any[]
  categories: string[]
}

export default function CatalogTable({ items, categories }: CatalogTableProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const handleDelete = async (itemId: string) => {
    if (!confirm('¿Seguro que quieres eliminar este item del catálogo?')) {
      return
    }

    setLoading(itemId)
    try {
      const { error } = await supabase.from('damage_catalog').delete().eq('id', itemId)
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al eliminar item')
    } finally {
      setLoading(null)
    }
  }

  const filteredItems = selectedCategory
    ? items.filter((item) => item.category === selectedCategory)
    : items

  return (
    <div>
      {/* Header with filter */}
      <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-medium">{filteredItems.length}</span> items
        </p>
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          options={categories}
          placeholder="Todas las categorías"
          className="w-48"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Categoría</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead align="right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.length === 0 ? (
            <TableEmptyRow colSpan={4} message="No se encontraron items" />
          ) : (
            filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Badge variant="primary">{item.category}</Badge>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-gray-900">{item.name}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-semibold text-gray-900">
                    €{item.estimated_price.toFixed(2)}
                  </p>
                </TableCell>
                <TableCell align="right">
                  <DropdownMenu disabled={loading === item.id}>
                    <DropdownMenuItem
                      icon={<Trash2 className="w-4 h-4" />}
                      variant="danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
