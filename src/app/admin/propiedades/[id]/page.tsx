import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PropertyForm from '@/components/admin/properties/property-form'

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  // Obtener la propiedad
  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !property) {
    notFound()
  }

  // Obtener lista de property managers
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
        <h1 className="text-2xl font-bold text-gray-900">Editar Propiedad</h1>
        <p className="text-gray-600">Modifica la información de la propiedad</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <PropertyForm property={property} propertyManagers={propertyManagers || []} />
      </div>
    </div>
  )
}
