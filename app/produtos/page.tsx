import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getProducts, getManufacturers } from "@/lib/data"
import { Plus, PlusCircle } from "lucide-react"
import Link from "next/link"
import { ProductsTable } from "./products-table"
import { ProductFilters } from "./product-filters"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { name?: string; manufacturer?: string; stock?: string }
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const { name, manufacturer, stock } = searchParams
  const products = await getProducts({ name, manufacturer, stock })
  const manufacturers = await getManufacturers()

  return (
    <div className="p-6 space-y-6 pt-16 md:pt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/produtos/adicionar-multiplos">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Múltiplos
            </Link>
          </Button>
          <Button asChild>
            <Link href="/produtos/novo">
              <Plus className="mr-2 h-4 w-4" /> Novo Produto
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductFilters manufacturers={manufacturers} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductsTable products={products} />
        </CardContent>
      </Card>
    </div>
  )
}
