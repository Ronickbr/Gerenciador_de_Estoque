import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductForm } from "../../product-form"
import { getProductById, getManufacturers } from "@/lib/data"

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const product = await getProductById(params.id)
  const manufacturers = await getManufacturers()

  if (!product) {
    redirect("/produtos")
  }

  return (
    <div className="p-6 space-y-6 pt-16 md:pt-6">
      <h1 className="text-3xl font-bold">Editar Produto</h1>

      <Card>
        <CardHeader>
          <CardTitle>Editar {product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm product={product} manufacturers={manufacturers} />
        </CardContent>
      </Card>
    </div>
  )
}
