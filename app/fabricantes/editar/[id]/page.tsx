import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ManufacturerForm } from "../../manufacturer-form"
import { getManufacturerById } from "@/lib/data"

export default async function EditManufacturerPage({ params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const manufacturer = await getManufacturerById(params.id)

  if (!manufacturer) {
    redirect("/fabricantes")
  }

  return (
    <div className="p-6 space-y-6 pt-16 md:pt-6">
      <h1 className="text-3xl font-bold">Editar Fabricante</h1>

      <Card>
        <CardHeader>
          <CardTitle>Editar {manufacturer.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <ManufacturerForm manufacturer={manufacturer} />
        </CardContent>
      </Card>
    </div>
  )
}
