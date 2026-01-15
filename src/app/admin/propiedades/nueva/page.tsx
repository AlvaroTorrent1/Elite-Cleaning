import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PropertyForm from '@/components/admin/properties/property-form'

export default async function NewPropertyPage() {
  const supabase = await createClient()

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener perfil y verificar que sea admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  // Obtener lista de property managers para asignar
  const { data: propertyManagers } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'property_manager')
    .eq('is_approved', true)
    .order('full_name')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Propiedad</h1>
        <p className="text-gray-600">Añade una nueva propiedad al sistema</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <PropertyForm propertyManagers={propertyManagers || []} />
      </div>
    </div>
  )
}
