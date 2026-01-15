'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Play, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CleaningStatusButtonProps {
  cleaningId: string
  currentStatus: string
}

export default function CleaningStatusButton({
  cleaningId,
  currentStatus,
}: CleaningStatusButtonProps) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  // Mutation para cambiar estado
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const updates: any = { status: newStatus }

      if (newStatus === 'in_progress') {
        updates.actual_start_time = new Date().toISOString()
      } else if (newStatus === 'completed') {
        updates.actual_end_time = new Date().toISOString()
      }

      const { error } = await supabase
        .from('cleanings')
        .update(updates)
        .eq('id', cleaningId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning', cleaningId] })
      router.refresh()
    },
    onError: (error) => {
      console.error('Error actualizando estado:', error)
      alert('❌ Error al actualizar el estado. Inténtalo de nuevo.')
    },
  })

  const handleStatusChange = async () => {
    if (currentStatus === 'pending') {
      // Confirmar inicio
      if (
        confirm('¿Comenzar esta limpieza ahora?\n\nSe registrará la hora de inicio.')
      ) {
        setIsUpdating(true)
        try {
          await updateStatusMutation.mutateAsync('in_progress')
        } finally {
          setIsUpdating(false)
        }
      }
    } else if (currentStatus === 'in_progress') {
      // Verificar que el checklist esté completo
      const { data: checklistProgress } = await supabase
        .from('cleaning_checklists')
        .select('completed_items')
        .eq('cleaning_id', cleaningId)
        .single()

      // Obtener el template para saber cuántas tareas hay
      const { data: cleaning } = await supabase
        .from('cleanings')
        .select('cleaning_type_id')
        .eq('id', cleaningId)
        .single()

      if (cleaning) {
        const { data: template } = await supabase
          .from('checklist_templates')
          .select('items')
          .eq('cleaning_type_id', cleaning.cleaning_type_id)
          .single()

        if (template) {
          const sections = template.items as any[]
          const totalTasks = sections.reduce(
            (acc: number, section: any) => acc + section.tasks.length,
            0
          )

          const completedItems = checklistProgress?.completed_items || {}
          const completedCount = Object.values(completedItems).filter(Boolean).length

          if (completedCount < totalTasks) {
            const proceed = confirm(
              `⚠️ Atención\n\nHas completado ${completedCount} de ${totalTasks} tareas del checklist.\n\n¿Estás seguro de que quieres finalizar esta limpieza?`
            )

            if (!proceed) return
          }
        }
      }

      // Confirmar finalización
      if (
        confirm(
          '¿Finalizar esta limpieza?\n\nSe registrará la hora de finalización y no podrás realizar más cambios.'
        )
      ) {
        setIsUpdating(true)
        try {
          await updateStatusMutation.mutateAsync('completed')
          setTimeout(() => {
            router.push('/limpiadora')
          }, 1000)
        } finally {
          setIsUpdating(false)
        }
      }
    }
  }

  // No mostrar botón si ya está completada o cancelada
  if (currentStatus === 'completed' || currentStatus === 'cancelled') {
    return null
  }

  const getButtonConfig = () => {
    if (currentStatus === 'pending') {
      return {
        icon: Play,
        text: 'Comenzar Limpieza',
        bgColor: 'bg-blue-600 hover:bg-blue-700',
      }
    } else if (currentStatus === 'in_progress') {
      return {
        icon: CheckCircle,
        text: 'Finalizar Limpieza',
        bgColor: 'bg-green-600 hover:bg-green-700',
      }
    }
    return null
  }

  const config = getButtonConfig()

  if (!config) return null

  const Icon = config.icon

  return (
    <div className="fixed bottom-24 left-0 right-0 px-4 z-20">
      <button
        onClick={handleStatusChange}
        disabled={isUpdating}
        className={`w-full max-w-md mx-auto flex items-center justify-center gap-2 py-4 px-6 ${config.bgColor} text-white rounded-full shadow-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isUpdating ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Actualizando...
          </>
        ) : (
          <>
            <Icon className="w-6 h-6" />
            {config.text}
          </>
        )}
      </button>
    </div>
  )
}
