"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

type Manufacturer = {
  id: string
  name: string
}

export function ProductFilters({ manufacturers }: { manufacturers: Manufacturer[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams],
  )

  const handleNameChange = (value: string) => {
    router.push(`${pathname}?${createQueryString("name", value)}`)
  }

  const handleManufacturerChange = (value: string) => {
    router.push(`${pathname}?${createQueryString("manufacturer", value)}`)
  }

  const handleStockChange = (value: string) => {
    router.push(`${pathname}?${createQueryString("stock", value)}`)
  }

  const handleClearFilters = () => {
    router.push(pathname)
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Produto</Label>
        <Input
          id="name"
          placeholder="Buscar por nome"
          defaultValue={searchParams.get("name") || ""}
          onChange={(e) => handleNameChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="manufacturer">Fabricante</Label>
        <Select defaultValue={searchParams.get("manufacturer") || ""} onValueChange={handleManufacturerChange}>
          <SelectTrigger id="manufacturer">
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
        <Label htmlFor="stock">Estoque</Label>
        <Select defaultValue={searchParams.get("stock") || ""} onValueChange={handleStockChange}>
          <SelectTrigger id="stock">
            <SelectValue placeholder="Qualquer quantidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Qualquer quantidade</SelectItem>
            <SelectItem value="low">Estoque baixo (&lt; 5)</SelectItem>
            <SelectItem value="medium">Estoque médio (5-20)</SelectItem>
            <SelectItem value="high">Estoque alto (&gt; 20)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button variant="outline" onClick={handleClearFilters}>
          Limpar Filtros
        </Button>
      </div>
    </div>
  )
}
