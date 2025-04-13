import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductForm } from "../product-form"
import { getManufacturers } from "@/lib/data"

export default async function NewProductPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const manufacturers = await getManufacturers()

  return (
    <div className="p-6 space-y-6 pt-16 md:pt-6">
      <h1 className="text-3xl font-bold">Novo Produto</h1>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm manufacturers={manufacturers} />
        </CardContent>
      </Card>
    </div>
  )
}
