'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
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
} from '@/components/ui'

export default function AddCatalogItem() {
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    estimated_price: '',
  })

  const categories = [
    'Lavandería',
    'Cocina',
    'Baño',
    'Muebles',
    'Bebé',
    'Electrónicos',
    'Exterior',
    'Otros',
  ]

  const handleClose = () => {
    setIsOpen(false)
    setFormData({ name: '', category: '', estimated_price: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.name || !formData.category || !formData.estimated_price) {
        alert('⚠️ Completa todos los campos')
        return
      }

      const { error } = await supabase.from('damage_catalog').insert({
        name: formData.name,
        category: formData.category,
        estimated_price: parseFloat(formData.estimated_price),
      })

      if (error) throw error

      handleClose()
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al añadir item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} leftIcon={<Plus className="w-5 h-5" />}>
        Añadir Item
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalHeader onClose={handleClose}>Añadir Item al Catálogo</ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody className="space-y-4">
            <Input
              label="Nombre del Item"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Toalla blanca - grande"
            />

            <Select
              label="Categoría"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={categories}
              placeholder="Seleccionar..."
            />

            <Input
              label="Precio Estimado (€)"
              type="number"
              step="0.01"
              min={0}
              required
              value={formData.estimated_price}
              onChange={(e) => setFormData({ ...formData, estimated_price: e.target.value })}
              placeholder="0.00"
            />
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
              {loading ? 'Añadiendo...' : 'Añadir Item'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  )
}
