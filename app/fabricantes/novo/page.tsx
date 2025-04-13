import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ManufacturerForm } from "../manufacturer-form"

export default async function NewManufacturerPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="p-6 space-y-6 pt-16 md:pt-6">
      <h1 className="text-3xl font-bold">Novo Fabricante</h1>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Fabricante</CardTitle>
        </CardHeader>
        <CardContent>
          <ManufacturerForm />
        </CardContent>
      </Card>
    </div>
  )
}
