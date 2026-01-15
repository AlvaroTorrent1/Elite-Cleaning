'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Camera, Loader2, Package, Trash2, X } from 'lucide-react'
import Image from 'next/image'

interface LostItemsTabProps {
  cleaningId: string
  cleaningStatus: string
}

export default function LostItemsTab({ cleaningId, cleaningStatus }: LostItemsTabProps) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)
  const [description, setDescription] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Cargar objetos perdidos
  const { data: lostItems, isLoading } = useQuery({
    queryKey: ['lost-items', cleaningId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cleaning_images')
        .select('*')
        .eq('cleaning_id', cleaningId)
        .eq('category', 'lost_item')
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      return data
    },
  })

  // Mutation para subir objeto perdido
  const addLostItemMutation = useMutation({
    mutationFn: async ({ image, desc }: { image: File; desc: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // Subir imagen
      const fileExt = image.name.split('.').pop()
      const fileName = `${cleaningId}/lost-items/${Date.now()}.${fileExt}`

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

      // Guardar en la base de datos
      const { error: dbError } = await supabase
        .from('cleaning_images')
        .insert({
          cleaning_id: cleaningId,
          category: 'lost_item',
          image_url: publicUrl,
          description: desc,
          uploaded_by: user.id,
        })

      if (dbError) throw dbError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lost-items', cleaningId] })
      setDescription('')
      setSelectedImage(null)
      setPreviewUrl(null)
      setIsAdding(false)
      alert('✅ Objeto perdido reportado correctamente')
    },
    onError: (error) => {
      console.error('Error reportando objeto perdido:', error)
      alert('❌ Error al reportar objeto perdido. Inténtalo de nuevo.')
    },
  })

  // Mutation para eliminar objeto perdido
  const deleteLostItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('cleaning_images')
        .delete()
        .eq('id', itemId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lost-items', cleaningId] })
    },
  })

  const handleImageSelect = (file: File) => {
    setSelectedImage(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleSubmit = async () => {
    if (!selectedImage || !description.trim()) {
      alert('⚠️ Debes añadir una foto y descripción del objeto perdido')
      return
    }

    setIsUploading(true)
    try {
      await addLostItemMutation.mutateAsync({
        image: selectedImage,
        desc: description.trim(),
      })
    } finally {
      setIsUploading(false)
    }
  }

  const isCleaningFinished = cleaningStatus === 'completed'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-800">
        <p className="font-medium mb-1">📦 Objetos Perdidos</p>
        <p>
          Si encuentras objetos olvidados por huéspedes anteriores, repórtalos aquí con una foto
          y descripción. El Property Manager será notificado automáticamente.
        </p>
      </div>

      {/* Add Button */}
      {!isCleaningFinished && !isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          <Package className="w-5 h-5" />
          Reportar Objeto Perdido
        </button>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="bg-white rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Nuevo Objeto Perdido</h3>
            <button
              onClick={() => {
                setIsAdding(false)
                setDescription('')
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
              Foto del objeto *
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
              <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
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
              Descripción del objeto *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Gafas de sol negras encontradas en el salón"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isUploading || !selectedImage || !description.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Package className="w-5 h-5" />
                Reportar Objeto
              </>
            )}
          </button>
        </div>
      )}

      {/* List */}
      {lostItems && lostItems.length > 0 ? (
        <div className="space-y-3">
          {lostItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border overflow-hidden">
              <div className="relative w-full aspect-video">
                <Image src={item.image_url} alt="Objeto perdido" fill className="object-cover" />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-900">{item.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(item.uploaded_at).toLocaleString('es-ES')}
                </p>
                {!isCleaningFinished && (
                  <button
                    onClick={() => {
                      if (confirm('¿Seguro que quieres eliminar este reporte?')) {
                        deleteLostItemMutation.mutate(item.id)
                      }
                    }}
                    className="mt-3 flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
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
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-600">No hay objetos perdidos reportados</p>
        </div>
      )}
    </div>
  )
}
