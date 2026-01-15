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
  Textarea,
} from '@/components/ui'

export default function AddCleaningType() {
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    estimated_duration_minutes: '',
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    })
  }

  const handleClose = () => {
    setIsOpen(false)
    setFormData({ name: '', slug: '', description: '', estimated_duration_minutes: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.name || !formData.slug) {
        alert('⚠️ El nombre y slug son obligatorios')
        return
      }

      const { error } = await supabase.from('cleaning_types').insert({
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        estimated_duration_minutes: formData.estimated_duration_minutes
          ? parseInt(formData.estimated_duration_minutes)
          : null,
      })

      if (error) throw error

      handleClose()
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      if (error.message?.includes('duplicate')) {
        alert('❌ Ya existe un tipo de limpieza con ese nombre o slug')
      } else {
        alert(`❌ Error: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} leftIcon={<Plus className="w-5 h-5" />}>
        Nuevo Tipo
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalHeader onClose={handleClose}>Nuevo Tipo de Limpieza</ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody className="space-y-4">
            <Input
              label="Nombre"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej: Limpieza Profunda"
            />

            <Input
              label="Slug (identificador)"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="limpieza_profunda"
              hint="Usado internamente, solo letras minúsculas y guiones bajos"
              className="font-mono text-sm"
            />

            <Textarea
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción detallada del tipo de limpieza..."
              rows={3}
            />

            <Input
              label="Duración Estimada (minutos)"
              type="number"
              min={1}
              value={formData.estimated_duration_minutes}
              onChange={(e) =>
                setFormData({ ...formData, estimated_duration_minutes: e.target.value })
              }
              placeholder="Ej: 120"
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
              {loading ? 'Creando...' : 'Crear'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  )
}
