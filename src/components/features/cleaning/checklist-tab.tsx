'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Camera, Check, ChevronDown, ChevronUp, Loader2, Upload } from 'lucide-react'
import Image from 'next/image'

interface ChecklistSection {
  id: string
  title: string
  tasks: Array<{
    id: string
    text: string
  }>
}

interface ChecklistTabProps {
  cleaningId: string
  cleaningStatus: string
}

export default function ChecklistTab({ cleaningId, cleaningStatus }: ChecklistTabProps) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({})

  // Cargar checklist template y progreso
  const { data: checklistData, isLoading } = useQuery({
    queryKey: ['checklist', cleaningId],
    queryFn: async () => {
      // Obtener información de la limpieza con el tipo
      const { data: cleaning } = await supabase
        .from('cleanings')
        .select(`
          *,
          cleaning_type:cleaning_types(id, name)
        `)
        .eq('id', cleaningId)
        .single()

      if (!cleaning) throw new Error('Limpieza no encontrada')

      // Obtener template basado en el tipo de limpieza
      const { data: template } = await supabase
        .from('checklist_templates')
        .select('*')
        .eq('cleaning_type_id', cleaning.cleaning_type_id)
        .single()

      // Obtener progreso guardado
      const { data: progress } = await supabase
        .from('cleaning_checklists')
        .select('*')
        .eq('cleaning_id', cleaningId)
        .single()

      // Obtener imágenes del checklist
      const { data: images } = await supabase
        .from('cleaning_images')
        .select('*')
        .eq('cleaning_id', cleaningId)
        .eq('category', 'checklist')

      return {
        template,
        progress,
        images: images || [],
      }
    },
  })

  // Inicializar tareas completadas cuando se carga el progreso
  useEffect(() => {
    if (checklistData?.progress?.completed_items) {
      setCompletedTasks(checklistData.progress.completed_items as Record<string, boolean>)
    }
  }, [checklistData])

  // Expandir primera sección por defecto
  useEffect(() => {
    if (checklistData?.template?.items && expandedSections.length === 0) {
      const sections = checklistData.template.items as ChecklistSection[]
      if (sections.length > 0) {
        setExpandedSections([sections[0].id])
      }
    }
  }, [checklistData, expandedSections])

  // Mutation para guardar progreso
  const saveProgressMutation = useMutation({
    mutationFn: async (completed: Record<string, boolean>) => {
      const progressId = checklistData?.progress?.id

      if (progressId) {
        // Actualizar progreso existente
        const { error } = await supabase
          .from('cleaning_checklists')
          .update({
            completed_items: completed,
            updated_at: new Date().toISOString(),
          })
          .eq('id', progressId)

        if (error) throw error
      } else {
        // Crear nuevo progreso
        const { error } = await supabase
          .from('cleaning_checklists')
          .insert({
            cleaning_id: cleaningId,
            template_id: checklistData?.template?.id,
            completed_items: completed,
          })

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', cleaningId] })
    },
  })

  // Subir imagen
  const handleImageUpload = async (taskId: string, file: File) => {
    setUploadingImages((prev) => ({ ...prev, [taskId]: true }))

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${cleaningId}/${taskId}_${Date.now()}.${fileExt}`

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('cleaning-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('cleaning-images')
        .getPublicUrl(fileName)

      // Guardar referencia en la base de datos
      const { error: dbError } = await supabase
        .from('cleaning_images')
        .insert({
          cleaning_id: cleaningId,
          category: 'checklist',
          checklist_item_id: taskId,
          image_url: publicUrl,
          uploaded_by: user.id,
        })

      if (dbError) throw dbError

      // Actualizar query
      queryClient.invalidateQueries({ queryKey: ['checklist', cleaningId] })
    } catch (error) {
      console.error('Error subiendo imagen:', error)
      alert('Error al subir la imagen. Por favor, inténtalo de nuevo.')
    } finally {
      setUploadingImages((prev) => ({ ...prev, [taskId]: false }))
    }
  }

  const toggleTask = (taskId: string) => {
    // Verificar si hay al menos una imagen para esta tarea
    const taskImages = checklistData?.images?.filter(
      (img) => img.checklist_item_id === taskId
    ) || []

    if (taskImages.length === 0 && !completedTasks[taskId]) {
      alert('⚠️ Debes subir al menos una foto antes de marcar esta tarea como completada')
      return
    }

    const newCompleted = {
      ...completedTasks,
      [taskId]: !completedTasks[taskId],
    }
    setCompletedTasks(newCompleted)
    saveProgressMutation.mutate(newCompleted)
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const getTaskImages = (taskId: string) => {
    return checklistData?.images?.filter((img) => img.checklist_item_id === taskId) || []
  }

  const isCleaningFinished = cleaningStatus === 'completed'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!checklistData?.template) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        No se encontró un checklist para este tipo de limpieza.
      </div>
    )
  }

  const sections = checklistData.template.items as ChecklistSection[]
  const totalTasks = sections.reduce((acc, section) => acc + section.tasks.length, 0)
  const completedCount = Object.values(completedTasks).filter(Boolean).length
  const progress = Math.round((completedCount / totalTasks) * 100)

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso</span>
          <span className="text-sm font-semibold text-blue-600">
            {completedCount} / {totalTasks} tareas
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const isExpanded = expandedSections.includes(section.id)
        const sectionCompletedCount = section.tasks.filter(
          (task) => completedTasks[task.id]
        ).length

        return (
          <div key={section.id} className="bg-white rounded-lg border overflow-hidden">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    sectionCompletedCount === section.tasks.length
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {sectionCompletedCount}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  <p className="text-xs text-gray-500">
                    {sectionCompletedCount} de {section.tasks.length} completadas
                  </p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Section Tasks */}
            {isExpanded && (
              <div className="border-t divide-y">
                {section.tasks.map((task) => {
                  const isCompleted = completedTasks[task.id]
                  const taskImages = getTaskImages(task.id)
                  const isUploading = uploadingImages[task.id]

                  return (
                    <div key={task.id} className="p-4 space-y-3">
                      {/* Task Row */}
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTask(task.id)}
                          disabled={isCleaningFinished}
                          className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            isCompleted
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 hover:border-blue-500'
                          } ${isCleaningFinished ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isCompleted && <Check className="w-4 h-4 text-white" />}
                        </button>
                        <p
                          className={`flex-1 text-sm ${
                            isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}
                        >
                          {task.text}
                        </p>
                      </div>

                      {/* Images */}
                      {taskImages.length > 0 && (
                        <div className="ml-9 grid grid-cols-3 gap-2">
                          {taskImages.map((img) => (
                            <div
                              key={img.id}
                              className="relative aspect-square rounded-lg overflow-hidden border"
                            >
                              <Image
                                src={img.image_url}
                                alt="Foto de checklist"
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload Button */}
                      {!isCleaningFinished && (
                        <div className="ml-9">
                          <label
                            className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                              isUploading
                                ? 'bg-gray-100 text-gray-400 cursor-wait'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Subiendo...</span>
                              </>
                            ) : (
                              <>
                                <Camera className="w-4 h-4" />
                                <span>Añadir foto</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  handleImageUpload(task.id, file)
                                  e.target.value = '' // Reset input
                                }
                              }}
                              disabled={isUploading}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">📸 Fotos obligatorias</p>
        <p>Debes subir al menos una foto para cada tarea antes de marcarla como completada.</p>
      </div>
    </div>
  )
}
