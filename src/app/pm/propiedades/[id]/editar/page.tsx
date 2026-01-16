import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PMPropertyForm from '@/components/pm/properties/pm-property-form'
import { PageHeader, Card } from '@/components/ui'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener la propiedad
  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .eq('property_manager_id', user.id) // Solo puede editar sus propias propiedades
    .single()

  if (error || !property) {
    notFound()
  }

  // Obtener tipos de limpieza
  const { data: cleaningTypes } = await supabase
    .from('cleaning_types')
    .select('id, name, slug')
    .order('name')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/pm/propiedades/${id}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
      </div>

      <PageHeader
        title="Editar Propiedad"
        description={`Editando: ${property.name}`}
      />

      <Card>
        <PMPropertyForm 
          property={property}
          cleaningTypes={cleaningTypes || []} 
          userId={user.id}
        />
      </Card>
    </div>
  )
}
