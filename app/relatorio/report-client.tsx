"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryMovementsTable } from "./inventory-movements-table"
import { MovementForm } from "./movement-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { ReportFilters } from "./report-filters"
import { useRouter } from "next/navigation"

type Product = {
  id: string
  name: string
  stock: number
  manufacturerId: string
}

type Manufacturer = {
  id: string
  name: string
}

type InventoryMovement = {
  id: string
  productId: string
  productName: string
  type: "entrada" | "saida"
  quantity: number
  date: string
  notes: string | null
  manufacturerId?: string
  manufacturerName?: string
}

export function ReportClient({
  initialMovements,
  products,
  manufacturers,
}: {
  initialMovements: InventoryMovement[]
  products: Product[]
  manufacturers: Manufacturer[]
}) {
  const router = useRouter()
  const [filters, setFilters] = useState({
    startDate: undefined,
    endDate: undefined,
    productId: "",
    manufacturerId: "",
    type: "",
  })

  const [filteredMovements, setFilteredMovements] = useState(initialMovements)

  // Aplicar filtros aos movimentos quando os filtros mudarem
  useEffect(() => {
    let filtered = [...initialMovements]

    // Filtrar por data inicial
    if (filters.startDate) {
      const start = new Date(filters.startDate)
      start.setHours(0, 0, 0, 0)
      filtered = filtered.filter((m) => new Date(m.date) >= start)
    }

    // Filtrar por data final
    if (filters.endDate) {
      const end = new Date(filters.endDate)
      end.setHours(23, 59, 59, 999)
      filtered = filtered.filter((m) => new Date(m.date) <= end)
    }

    // Filtrar por produto
    if (filters.productId && filters.productId !== "all") {
      filtered = filtered.filter((m) => m.productId === filters.productId)
    }

    // Filtrar por fabricante
    if (filters.manufacturerId && filters.manufacturerId !== "all") {
      filtered = filtered.filter((m) => m.manufacturerId === filters.manufacturerId)
    }

    // Filtrar por tipo
    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((m) => m.type === filters.type)
    }

    setFilteredMovements(filtered)
  }, [initialMovements, filters])

  const handleFilter = (newFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className="p-6 space-y-6 pt-16 md:pt-6">
      <h1 className="text-3xl font-bold">Relatório de Movimentação</h1>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="history" className="flex-1 md:flex-none">
            Histórico
          </TabsTrigger>
          <TabsTrigger value="add" className="flex-1 md:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            Nova Movimentação
          </TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="space-y-4">
          <ReportFilters
            products={products}
            manufacturers={manufacturers}
            movements={initialMovements}
            onFilter={handleFilter}
          />
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              <InventoryMovementsTable movements={filteredMovements} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Nova Movimentação</CardTitle>
            </CardHeader>
            <CardContent>
              <MovementForm
                products={products}
                manufacturers={manufacturers}
                onSuccess={() => {
                  router.refresh()
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
