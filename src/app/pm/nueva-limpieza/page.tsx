import { createClient } from '@/lib/supabase/server'
import NewCleaningForm from '@/components/pm/cleanings/new-cleaning-form'
import { PageHeader, Card } from '@/components/ui'

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
      <PageHeader
        title="Solicitar Limpieza Manual"
        description="Crea una limpieza puntual no vinculada a reservas de iCal"
      />

      <Card>
        <NewCleaningForm
          properties={properties || []}
          cleaningTypes={cleaningTypes || []}
          extras={extras || []}
        />
      </Card>
    </div>
  )
}
