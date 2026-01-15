'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save } from 'lucide-react'

interface NewCleaningFormProps {
  properties: Array<{
    id: string
    name: string
    address: string
  }>
  cleaningTypes: Array<{
    id: string
    name: string
    description: string | null
  }>
  extras: Array<{
    id: string
    name: string
    description: string | null
  }>
}

export default function NewCleaningForm({
  properties,
  cleaningTypes,
  extras,
}: NewCleaningFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    property_id: '',
    cleaning_type_id: '',
    scheduled_date: '',
    scheduled_time: '09:00',
    notes: '',
  })
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Crear limpieza
      const { data: cleaning, error: cleaningError } = await supabase
        .from('cleanings')
        .insert({
          ...formData,
          is_manual: true,
          status: 'pending',
        })
        .select()
        .single()

      if (cleaningError) throw cleaningError

      // Agregar extras si hay
      if (selectedExtras.length > 0 && cleaning) {
        const extrasData = selectedExtras.map((extraId) => ({
          cleaning_id: cleaning.id,
          extra_id: extraId,
          quantity: 1,
        }))

        const { error: extrasError } = await supabase
          .from('cleaning_selected_extras')
          .insert(extrasData)

        if (extrasError) throw extrasError
      }

      alert('✅ Limpieza creada exitosamente')
      router.push('/pm/limpiezas')
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al crear limpieza')
    } finally {
      setLoading(false)
    }
  }

  const toggleExtra = (extraId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraId) ? prev.filter((id) => id !== extraId) : [...prev, extraId]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Property */}
      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Propiedad <span className="text-[#EF4444]">*</span>
        </label>
        <select
          required
          value={formData.property_id}
          onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
          className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-[#111827]"
        >
          <option value="">Selecciona una propiedad</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name} - {property.address}
            </option>
          ))}
        </select>
      </div>

      {/* Cleaning Type */}
      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Tipo de Limpieza <span className="text-[#EF4444]">*</span>
        </label>
        <select
          required
          value={formData.cleaning_type_id}
          onChange={(e) => setFormData({ ...formData, cleaning_type_id: e.target.value })}
          className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-[#111827]"
        >
          <option value="">Selecciona tipo de limpieza</option>
          {cleaningTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
              {type.description && ` - ${type.description}`}
            </option>
          ))}
        </select>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2">
            Fecha <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.scheduled_date}
            onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-[#111827]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2">
            Hora <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="time"
            required
            value={formData.scheduled_time}
            onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
            className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-[#111827]"
          />
        </div>
      </div>

      {/* Extras */}
      {extras.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[#111827] mb-3">
            Servicios Extras (Opcionales)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {extras.map((extra) => (
              <label
                key={extra.id}
                className="flex items-start gap-3 p-4 border-2 border-[#E5E7EB] rounded-lg cursor-pointer hover:border-[#1E40AF] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedExtras.includes(extra.id)}
                  onChange={() => toggleExtra(extra.id)}
                  className="mt-0.5 w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                />
                <div>
                  <p className="font-medium text-[#111827]">{extra.name}</p>
                  {extra.description && (
                    <p className="text-sm text-[#6B7280] mt-1">{extra.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Notas o Instrucciones Especiales
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          placeholder="Ej: Limpieza urgente por nuevos huéspedes..."
          className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-[#111827] resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-6 py-2 text-[#6B7280] bg-[#F9FAFB] hover:bg-[#E5E7EB] rounded-lg transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Crear Limpieza
            </>
          )}
        </button>
      </div>
    </form>
  )
}
