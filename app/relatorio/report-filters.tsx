"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, Printer, Search, FilterX } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { exportToExcel, printData } from "@/lib/export-utils"

type Product = {
  id: string
  name: string
  stock: number
}

type Manufacturer = {
  id: string
  name: string
}

type InventoryMovement = {
  id: string
  productName: string
  productId?: string
  type: "entrada" | "saida"
  quantity: number
  date: string
  notes: string | null
  manufacturerId?: string
  manufacturerName?: string
}

type ReportFiltersProps = {
  products: Product[]
  manufacturers: Manufacturer[]
  movements: InventoryMovement[]
  onFilter: (filters: {
    startDate: Date | undefined
    endDate: Date | undefined
    productId: string
    manufacturerId: string
    type: string
  }) => void
}

export function ReportFilters({ products, manufacturers, movements, onFilter }: ReportFiltersProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [productId, setProductId] = useState("")
  const [manufacturerId, setManufacturerId] = useState("")
  const [type, setType] = useState("")
  const [filteredMovements, setFilteredMovements] = useState(movements)

  // Aplicar filtros aos movimentos
  useEffect(() => {
    let filtered = [...movements]

    // Filtrar por data inicial
    if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      filtered = filtered.filter((m) => new Date(m.date) >= start)
    }

    // Filtrar por data final
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filtered = filtered.filter((m) => new Date(m.date) <= end)
    }

    // Filtrar por produto
    if (productId && productId !== "all") {
      filtered = filtered.filter((m) => m.productId === productId)
    }

    // Filtrar por fabricante
    if (manufacturerId && manufacturerId !== "all") {
      filtered = filtered.filter((m) => m.manufacturerId === manufacturerId)
    }

    // Filtrar por tipo
    if (type && type !== "all") {
      filtered = filtered.filter((m) => m.type === type)
    }

    setFilteredMovements(filtered)
  }, [movements, startDate, endDate, productId, manufacturerId, type])

  const handleFilter = () => {
    onFilter({
      startDate,
      endDate,
      productId,
      manufacturerId,
      type,
    })
  }

  const handleClearFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setProductId("")
    setManufacturerId("")
    setType("")
    onFilter({
      startDate: undefined,
      endDate: undefined,
      productId: "",
      manufacturerId: "",
      type: "",
    })
  }

  const handleExportExcel = () => {
    exportToExcel(filteredMovements, "relatorio-movimentacao")
  }

  const handlePrint = () => {
    printData(filteredMovements)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <Label>Data Inicial</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Data Final</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Fabricante</Label>
            <Select value={manufacturerId} onValueChange={setManufacturerId}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os fabricantes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os fabricantes</SelectItem>
                {manufacturers.map((manufacturer) => (
                  <SelectItem key={manufacturer.id} value={manufacturer.id}>
                    {manufacturer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Produto</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os produtos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os produtos</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleFilter} className="flex-1 sm:flex-none">
              <Search className="mr-2 h-4 w-4" />
              <span className="sm:inline">Filtrar</span>
            </Button>
            <Button variant="outline" onClick={handleClearFilters} className="flex-1 sm:flex-none">
              <FilterX className="mr-2 h-4 w-4" />
              <span className="sm:inline">Limpar</span>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExportExcel} className="flex-1 sm:flex-none">
              <Download className="mr-2 h-4 w-4" />
              <span className="sm:inline">Excel</span>
            </Button>
            <Button variant="outline" onClick={handlePrint} className="flex-1 sm:flex-none">
              <Printer className="mr-2 h-4 w-4" />
              <span className="sm:inline">Imprimir</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
