import { createClient } from '@/lib/supabase/server'
import PMPropertyForm from '@/components/pm/properties/pm-property-form'
import { PageHeader, Card } from '@/components/ui'

export default async function NewPropertyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Obtener tipos de limpieza para el default
  const { data: cleaningTypes } = await supabase
    .from('cleaning_types')
    .select('id, name, slug')
    .order('name')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Nueva Propiedad"
        description="Añade una nueva propiedad a tu cartera de gestión"
      />

      <Card>
        <PMPropertyForm 
          cleaningTypes={cleaningTypes || []} 
          userId={user.id}
        />
      </Card>
    </div>
  )
}
