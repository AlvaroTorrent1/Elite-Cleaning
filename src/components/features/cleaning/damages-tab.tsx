'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Camera, Loader2, AlertTriangle, Trash2, X } from 'lucide-react'
import Image from 'next/image'

interface DamagesTabProps {
  cleaningId: string
  cleaningStatus: string
}

interface DamageCatalogItem {
  id: string
  name: string
  estimated_price: number
  category: string
}

export default function DamagesTab({ cleaningId, cleaningStatus }: DamagesTabProps) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)
  const [description, setDescription] = useState('')
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<string | null>(null)
  const [customPrice, setCustomPrice] = useState<string>('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Cargar catálogo de daños
  const { data: catalogItems } = useQuery({
    queryKey: ['damage-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('damage_catalog')
        .select('*')
        .order('category', { ascending: true })

      if (error) throw error
      return data as DamageCatalogItem[]
    },
  })

  // Cargar daños reportados
  const { data: damages, isLoading } = useQuery({
    queryKey: ['damages', cleaningId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('damage_reports')
        .select(`
          *,
          catalog_item:damage_catalog(name, estimated_price),
          reporter:profiles(full_name)
        `)
        .eq('cleaning_id', cleaningId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })

  // Mutation para reportar daño
  const addDamageMutation = useMutation({
    mutationFn: async ({
      image,
      desc,
      catalogItemId,
      price,
    }: {
      image: File
      desc: string
      catalogItemId: string | null
      price: number
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // Subir imagen
      const fileExt = image.name.split('.').pop()
      const fileName = `${cleaningId}/damages/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('cleaning-images')
        .upload(fileName, image, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('cleaning-images')
        .getPublicUrl(fileName)

      // Guardar reporte de daño
      const { error: dbError } = await supabase
        .from('damage_reports')
        .insert({
          cleaning_id: cleaningId,
          catalog_item_id: catalogItemId,
          description: desc,
          image_url: publicUrl,
          estimated_cost: price,
          reported_by: user.id,
          status: 'pending',
        })

      if (dbError) throw dbError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['damages', cleaningId] })
      setDescription('')
      setSelectedCatalogItem(null)
      setCustomPrice('')
      setSelectedImage(null)
      setPreviewUrl(null)
      setIsAdding(false)
      alert('✅ Daño reportado correctamente. El Property Manager será notificado.')
    },
    onError: (error) => {
      console.error('Error reportando daño:', error)
      alert('❌ Error al reportar daño. Inténtalo de nuevo.')
    },
  })

  // Mutation para eliminar daño
  const deleteDamageMutation = useMutation({
    mutationFn: async (damageId: string) => {
      const { error } = await supabase
        .from('damage_reports')
        .delete()
        .eq('id', damageId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['damages', cleaningId] })
    },
  })

  const handleImageSelect = (file: File) => {
    setSelectedImage(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleSubmit = async () => {
    if (!selectedImage || !description.trim()) {
      alert('⚠️ Debes añadir una foto y descripción del daño')
      return
    }

    // Determinar precio
    let finalPrice = 0
    if (selectedCatalogItem) {
      const item = catalogItems?.find((i) => i.id === selectedCatalogItem)
      finalPrice = item?.estimated_price || 0
    } else {
      finalPrice = parseFloat(customPrice) || 0
    }

    if (finalPrice <= 0) {
      alert('⚠️ Debes seleccionar un item del catálogo o ingresar un precio estimado')
      return
    }

    setIsUploading(true)
    try {
      await addDamageMutation.mutateAsync({
        image: selectedImage,
        desc: description.trim(),
        catalogItemId: selectedCatalogItem,
        price: finalPrice,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const isCleaningFinished = cleaningStatus === 'completed'

  // Agrupar items del catálogo por categoría
  const groupedCatalog = catalogItems?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, DamageCatalogItem[]>)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
        <p className="font-medium mb-1">⚠️ Reporte de Daños</p>
        <p>
          Si encuentras objetos dañados o en mal estado (lavandería, muebles, electrodomésticos),
          repórtalos aquí. Incluye foto, descripción y selecciona el item del catálogo para
          estimar el costo.
        </p>
      </div>

      {/* Add Button */}
      {!isCleaningFinished && !isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          <AlertTriangle className="w-5 h-5" />
          Reportar Daño
        </button>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="bg-white rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Nuevo Reporte de Daño</h3>
            <button
              onClick={() => {
                setIsAdding(false)
                setDescription('')
                setSelectedCatalogItem(null)
                setCustomPrice('')
                setSelectedImage(null)
                setPreviewUrl(null)
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto del daño *
            </label>
            {previewUrl ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                <button
                  onClick={() => {
                    setSelectedImage(null)
                    setPreviewUrl(null)
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                <Camera className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Toca para tomar foto o subir imagen</p>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageSelect(file)
                  }}
                />
              </label>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del daño *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Toalla blanca manchada de maquillaje, no se puede lavar"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Catalog Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item del catálogo
            </label>
            <select
              value={selectedCatalogItem || ''}
              onChange={(e) => {
                setSelectedCatalogItem(e.target.value || null)
                setCustomPrice('') // Reset custom price
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Seleccionar item...</option>
              {groupedCatalog &&
                Object.entries(groupedCatalog).map(([category, items]) => (
                  <optgroup key={category} label={category}>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - €{item.estimated_price.toFixed(2)}
                      </option>
                    ))}
                  </optgroup>
                ))}
            </select>
          </div>

          {/* Custom Price (if no catalog item selected) */}
          {!selectedCatalogItem && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio estimado (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={
              isUploading ||
              !selectedImage ||
              !description.trim() ||
              (!selectedCatalogItem && !customPrice)
            }
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5" />
                Reportar Daño
              </>
            )}
          </button>
        </div>
      )}

      {/* List */}
      {damages && damages.length > 0 ? (
        <div className="space-y-3">
          {damages.map((damage) => (
            <div key={damage.id} className="bg-white rounded-lg border overflow-hidden">
              <div className="relative w-full aspect-video">
                <Image src={damage.image_url} alt="Daño" fill className="object-cover" />
              </div>
              <div className="p-4 space-y-2">
                {damage.catalog_item && (
                  <p className="text-sm font-semibold text-red-700">
                    {damage.catalog_item.name}
                  </p>
                )}
                <p className="text-sm text-gray-900">{damage.description}</p>
                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="text-lg font-bold text-red-600">
                    €{damage.estimated_cost.toFixed(2)}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(damage.created_at).toLocaleString('es-ES')}
                  </span>
                </div>
                {!isCleaningFinished && damage.status === 'pending' && (
                  <button
                    onClick={() => {
                      if (confirm('¿Seguro que quieres eliminar este reporte?')) {
                        deleteDamageMutation.mutate(damage.id)
                      }
                    }}
                    className="mt-2 flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-600">No hay daños reportados</p>
        </div>
      )}
    </div>
  )
}
