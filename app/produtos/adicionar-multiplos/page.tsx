import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getManufacturers } from "@/lib/data"
import { MultiProductForm } from "../multi-product-form"

export default async function AddMultipleProductsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const manufacturers = await getManufacturers()

  return (
    <div className="p-6 space-y-6 pt-16 md:pt-6">
      <h1 className="text-3xl font-bold">Adicionar Múltiplos Produtos</h1>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Produtos em Lote</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiProductForm manufacturers={manufacturers} />
        </CardContent>
      </Card>
    </div>
  )
}
