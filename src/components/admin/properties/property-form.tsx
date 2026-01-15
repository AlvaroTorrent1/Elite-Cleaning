'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import {
  Button,
  Input,
  Select,
  Textarea,
  Checkbox,
  Card,
  CardTitle,
  CardDescription,
} from '@/components/ui'

interface PropertyFormProps {
  property?: any
  propertyManagers: Array<{
    id: string
    full_name: string | null
    email: string
  }>
}

export default function PropertyForm({ property, propertyManagers }: PropertyFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: property?.name || '',
    address: property?.address || '',
    city: property?.city || 'Málaga',
    postal_code: property?.postal_code || '',
    bedrooms: property?.bedrooms || 1,
    bathrooms: property?.bathrooms || 1,
    size_sqm: property?.size_sqm || '',
    access_instructions: property?.access_instructions || '',
    property_manager_id: property?.property_manager_id || '',
    ical_airbnb: property?.ical_airbnb || '',
    ical_booking: property?.ical_booking || '',
    ical_other: property?.ical_other || '',
    default_cleaning_type: property?.default_cleaning_type || 'estandar',
    gps_lat: property?.gps_lat || null,
    gps_lng: property?.gps_lng || null,
    is_active: property?.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.name || !formData.address || !formData.city) {
        alert('⚠️ Por favor completa los campos obligatorios')
        return
      }

      const propertyData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postal_code || null,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        size_sqm: formData.size_sqm ? parseInt(formData.size_sqm.toString()) : null,
        access_instructions: formData.access_instructions || null,
        property_manager_id: formData.property_manager_id || null,
        ical_airbnb: formData.ical_airbnb || null,
        ical_booking: formData.ical_booking || null,
        ical_other: formData.ical_other || null,
        default_cleaning_type: formData.default_cleaning_type,
        gps_lat: formData.gps_lat,
        gps_lng: formData.gps_lng,
        is_active: formData.is_active,
      }

      if (property) {
        const { error } = await supabase
          .from('properties')
          .update({ ...propertyData, updated_at: new Date().toISOString() })
          .eq('id', property.id)

        if (error) throw error
        alert('✅ Propiedad actualizada correctamente')
      } else {
        const { error } = await supabase.from('properties').insert(propertyData)
        if (error) throw error
        alert('✅ Propiedad creada correctamente')
      }

      router.push('/admin/propiedades')
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const cleaningTypeOptions = [
    { value: 'repaso', label: 'Repaso' },
    { value: 'estandar', label: 'Estándar' },
    { value: 'profunda', label: 'Profunda' },
  ]

  const pmOptions = propertyManagers.map((pm) => ({
    value: pm.id,
    label: pm.full_name || pm.email,
  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <Card>
        <CardTitle>Información Básica</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Nombre de la Propiedad"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Apartamento Sol 3B"
          />

          <Input
            label="Ciudad"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Málaga"
          />

          <div className="md:col-span-2">
            <Input
              label="Dirección"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Calle Larios 15, 3º B"
            />
          </div>

          <Input
            label="Código Postal"
            value={formData.postal_code}
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
            placeholder="29001"
          />

          <Select
            label="Property Manager"
            value={formData.property_manager_id}
            onChange={(e) => setFormData({ ...formData, property_manager_id: e.target.value })}
            options={pmOptions}
            placeholder="Sin asignar"
          />

          <Input
            label="Habitaciones"
            type="number"
            min={1}
            value={formData.bedrooms}
            onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
          />

          <Input
            label="Baños"
            type="number"
            min={1}
            value={formData.bathrooms}
            onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
          />

          <Input
            label="Metros Cuadrados"
            type="number"
            min={1}
            value={formData.size_sqm}
            onChange={(e) => setFormData({ ...formData, size_sqm: e.target.value })}
            placeholder="Ej: 75"
          />

          <Select
            label="Tipo de Limpieza por Defecto"
            value={formData.default_cleaning_type}
            onChange={(e) => setFormData({ ...formData, default_cleaning_type: e.target.value })}
            options={cleaningTypeOptions}
          />
        </div>
      </Card>

      {/* Instrucciones de Acceso */}
      <Card>
        <CardTitle>Instrucciones de Acceso</CardTitle>
        <div className="mt-4">
          <Textarea
            value={formData.access_instructions}
            onChange={(e) => setFormData({ ...formData, access_instructions: e.target.value })}
            placeholder="Código portal, ubicación del lockbox, instrucciones de entrada..."
            rows={4}
          />
        </div>
      </Card>

      {/* iCal */}
      <Card>
        <CardTitle>Integración iCal</CardTitle>
        <CardDescription>
          URLs de calendario para sincronizar reservas automáticamente
        </CardDescription>
        <div className="grid grid-cols-1 gap-4 mt-4">
          <Input
            label="iCal Airbnb"
            type="url"
            value={formData.ical_airbnb}
            onChange={(e) => setFormData({ ...formData, ical_airbnb: e.target.value })}
            placeholder="https://www.airbnb.com/calendar/ical/..."
          />

          <Input
            label="iCal Booking.com"
            type="url"
            value={formData.ical_booking}
            onChange={(e) => setFormData({ ...formData, ical_booking: e.target.value })}
            placeholder="https://admin.booking.com/..."
          />

          <Input
            label="iCal Otro (VRBO, etc.)"
            type="url"
            value={formData.ical_other}
            onChange={(e) => setFormData({ ...formData, ical_other: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </Card>

      {/* Estado */}
      <Card>
        <Checkbox
          label="Propiedad activa"
          description="Las propiedades inactivas no aparecen en las asignaciones de limpieza"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
        />
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Link href="/admin/propiedades">
          <Button type="button" variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Cancelar
          </Button>
        </Link>

        <Button
          type="submit"
          loading={loading}
          leftIcon={!loading ? <Save className="w-5 h-5" /> : undefined}
        >
          {loading ? 'Guardando...' : `${property ? 'Actualizar' : 'Crear'} Propiedad`}
        </Button>
      </div>
    </form>
  )
}
