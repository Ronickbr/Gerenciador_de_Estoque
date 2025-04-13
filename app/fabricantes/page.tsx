import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getManufacturers } from "@/lib/data"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ManufacturerTable } from "./manufacturer-table"

export default async function ManufacturersPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const manufacturers = await getManufacturers()

  return (
    <div className="p-6 space-y-6 pt-16 md:pt-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fabricantes</h1>
        <Button asChild>
          <Link href="/fabricantes/novo">
            <Plus className="mr-2 h-4 w-4" /> Novo Fabricante
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Fabricantes</CardTitle>
        </CardHeader>
        <CardContent>
          <ManufacturerTable manufacturers={manufacturers} />
        </CardContent>
      </Card>
    </div>
  )
}
