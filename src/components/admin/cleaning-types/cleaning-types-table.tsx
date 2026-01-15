'use client'

import { useState } from 'react'
import { Clock, Edit, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuItem,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableInfo,
  TableEmptyRow,
  Input,
} from '@/components/ui'

interface CleaningTypesTableProps {
  cleaningTypes: Array<{
    id: string
    name: string
    slug: string
    description: string | null
    estimated_duration_minutes: number | null
    cleanings_count: number
  }>
}

export default function CleaningTypesTable({ cleaningTypes }: CleaningTypesTableProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    estimated_duration_minutes: '',
  })

  const handleEdit = (type: any) => {
    setEditingId(type.id)
    setEditForm({
      name: type.name,
      description: type.description || '',
      estimated_duration_minutes: type.estimated_duration_minutes?.toString() || '',
    })
  }

  const handleSave = async (typeId: string) => {
    setLoading(typeId)
    try {
      const { error } = await supabase
        .from('cleaning_types')
        .update({
          name: editForm.name,
          description: editForm.description || null,
          estimated_duration_minutes: editForm.estimated_duration_minutes
            ? parseInt(editForm.estimated_duration_minutes)
            : null,
        })
        .eq('id', typeId)

      if (error) throw error

      setEditingId(null)
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (typeId: string, cleaningsCount: number) => {
    if (cleaningsCount > 0) {
      alert('⚠️ No se puede eliminar un tipo de limpieza que tiene limpiezas asociadas')
      return
    }

    if (!confirm('¿Estás seguro de que quieres eliminar este tipo de limpieza?')) {
      return
    }

    setLoading(typeId)
    try {
      const { error } = await supabase.from('cleaning_types').delete().eq('id', typeId)
      if (error) throw error
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <TableInfo showing={cleaningTypes.length} total={cleaningTypes.length} entity="tipos de limpieza" />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Duración</TableHead>
            <TableHead>Limpiezas</TableHead>
            <TableHead align="right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cleaningTypes.length === 0 ? (
            <TableEmptyRow colSpan={6} message="No hay tipos de limpieza configurados" />
          ) : (
            cleaningTypes.map((type) => (
              <TableRow key={type.id}>
                {editingId === type.id ? (
                  <>
                    <TableCell>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="py-1"
                      />
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{type.slug}</TableCell>
                    <TableCell>
                      <Input
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="Descripción..."
                        className="py-1"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editForm.estimated_duration_minutes}
                        onChange={(e) =>
                          setEditForm({ ...editForm, estimated_duration_minutes: e.target.value })
                        }
                        placeholder="min"
                        className="w-20 py-1"
                      />
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{type.cleanings_count}</TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSave(type.id)}
                          loading={loading === type.id}
                        >
                          Guardar
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="font-medium text-gray-900">{type.name}</TableCell>
                    <TableCell className="text-sm text-gray-500">{type.slug}</TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                      {type.description || '-'}
                    </TableCell>
                    <TableCell>
                      {type.estimated_duration_minutes ? (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {type.estimated_duration_minutes} min
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="primary">{type.cleanings_count}</Badge>
                    </TableCell>
                    <TableCell align="right">
                      <DropdownMenu disabled={loading === type.id}>
                        <DropdownMenuItem
                          icon={<Edit className="w-4 h-4" />}
                          onClick={() => handleEdit(type)}
                        >
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          icon={<Trash2 className="w-4 h-4" />}
                          variant="danger"
                          onClick={() => handleDelete(type.id, type.cleanings_count)}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenu>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
