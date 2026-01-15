import { createClient } from '@/lib/supabase/server'
import NewCleaningForm from '@/components/pm/cleanings/new-cleaning-form'
import { PlusCircle } from 'lucide-react'

export default async function NewCleaningPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Obtener propiedades del PM
  const { data: properties } = await supabase
    .from('properties')
    .select('id, name, address')
    .eq('property_manager_id', user.id)
    .order('name')

  // Obtener tipos de limpieza
  const { data: cleaningTypes } = await supabase
    .from('cleaning_types')
    .select('*')
    .order('name')

  // Obtener extras disponibles
  const { data: extras } = await supabase.from('cleaning_extras').select('*').order('name')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-3 mb-2">
          <PlusCircle className="w-6 h-6 text-[#1E40AF]" />
          <h1 className="text-2xl font-bold text-[#111827]">Solicitar Limpieza Manual</h1>
        </div>
        <p className="text-[#6B7280]">
          Crea una limpieza puntual no vinculada a reservas de iCal
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <NewCleaningForm
          properties={properties || []}
          cleaningTypes={cleaningTypes || []}
          extras={extras || []}
        />
      </div>
    </div>
  )
}
