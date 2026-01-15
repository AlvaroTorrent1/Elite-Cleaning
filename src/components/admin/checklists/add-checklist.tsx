'use client'

import { useState } from 'react'
import { Plus, Trash2, Camera, GripVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  Label,
  EmptyState,
} from '@/components/ui'

interface AddChecklistProps {
  cleaningTypes: Array<{ id: string; name: string }>
}

interface ChecklistItem {
  id: string
  name: string
  requires_photo: boolean
  order: number
}

export default function AddChecklist({ cleaningTypes }: AddChecklistProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    cleaning_type_id: '',
  })
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [newItemName, setNewItemName] = useState('')

  const addItem = () => {
    if (!newItemName.trim()) return

    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      name: newItemName.trim(),
      requires_photo: true,
      order: items.length,
    }

    setItems([...items, newItem])
    setNewItemName('')
  }

  const removeItem = (itemId: string) => {
    setItems(items.filter((i) => i.id !== itemId).map((i, idx) => ({ ...i, order: idx })))
  }

  const togglePhoto = (itemId: string) => {
    setItems(
      items.map((i) => (i.id === itemId ? { ...i, requires_photo: !i.requires_photo } : i))
    )
  }

  const handleClose = () => {
    setIsOpen(false)
    setFormData({ name: '', cleaning_type_id: '' })
    setItems([])
    setNewItemName('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.name) {
        alert('⚠️ El nombre es obligatorio')
        return
      }

      if (items.length === 0) {
        alert('⚠️ Debes agregar al menos un item al checklist')
        return
      }

      const { error } = await supabase.from('checklist_templates').insert({
        name: formData.name,
        cleaning_type_id: formData.cleaning_type_id || null,
        items: items,
      })

      if (error) throw error

      handleClose()
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} leftIcon={<Plus className="w-5 h-5" />}>
        Nuevo Template
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} size="lg">
        <ModalHeader onClose={handleClose}>Nuevo Template de Checklist</ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre del Template"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Checklist Limpieza Estándar"
              />

              <Select
                label="Tipo de Limpieza"
                value={formData.cleaning_type_id}
                onChange={(e) => setFormData({ ...formData, cleaning_type_id: e.target.value })}
                options={cleaningTypes.map((t) => ({ value: t.id, label: t.name }))}
                placeholder="Genérico (todos los tipos)"
              />
            </div>

            {/* Items section */}
            <div>
              <Label>Items del Checklist ({items.length})</Label>

              {/* Add item input */}
              <div className="flex gap-2 mb-3 mt-1">
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
                  placeholder="Nombre del item (Enter para agregar)"
                />
                <Button type="button" variant="secondary" size="icon" onClick={addItem}>
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              {/* Items list */}
              <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                {items.length === 0 ? (
                  <EmptyState
                    title="No hay items"
                    description="Agrega tareas al checklist"
                    size="sm"
                  />
                ) : (
                  <div className="divide-y divide-gray-100">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                      >
                        <GripVertical className="w-4 h-4 text-gray-300" />
                        <span className="text-xs text-gray-400 w-5">{index + 1}.</span>
                        <span className="flex-1 text-sm text-gray-700">{item.name}</span>
                        <Button
                          type="button"
                          variant={item.requires_photo ? 'primary' : 'ghost'}
                          size="xs"
                          onClick={() => togglePhoto(item.id)}
                          title={item.requires_photo ? 'Foto obligatoria' : 'Sin foto'}
                          className={item.requires_photo ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : ''}
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <Camera className="w-3 h-3 inline mr-1" />
                Haz clic en el icono de cámara para activar/desactivar foto obligatoria
              </p>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={handleClose} fullWidth>
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={loading}
              leftIcon={!loading ? <Plus className="w-4 h-4" /> : undefined}
              fullWidth
            >
              {loading ? 'Creando...' : 'Crear Template'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  )
}
