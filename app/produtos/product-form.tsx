"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createProduct, updateProduct } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

type Manufacturer = {
  id: string
  name: string
}

type Product = {
  id: string
  name: string
  manufacturerId: string
  stock: number
}

export function ProductForm({
  product,
  manufacturers,
}: {
  product?: Product
  manufacturers: Manufacturer[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState(product?.name || "")
  const [manufacturerId, setManufacturerId] = useState(product?.manufacturerId || "")
  const [stock, setStock] = useState(product?.stock.toString() || "0")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (product) {
        await updateProduct(product.id, {
          name,
          manufacturerId,
          stock: Number.parseInt(stock),
        })
        toast({
          title: "Produto atualizado",
          description: "As alterações foram salvas com sucesso.",
        })
      } else {
        await createProduct({
          name,
          manufacturerId,
          stock: Number.parseInt(stock),
        })
        toast({
          title: "Produto criado",
          description: "O novo produto foi adicionado com sucesso.",
        })
      }
      router.push("/produtos")
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar o produto.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Produto</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite o nome do produto"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="manufacturer">Fabricante</Label>
        <Select value={manufacturerId} onValueChange={setManufacturerId} required>
          <SelectTrigger id="manufacturer">
            <SelectValue placeholder="Selecione um fabricante" />
          </SelectTrigger>
          <SelectContent>
            {manufacturers.map((manufacturer) => (
              <SelectItem key={manufacturer.id} value={manufacturer.id}>
                {manufacturer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="stock">Quantidade em Estoque</Label>
        <Input id="stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} required />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => router.push("/produtos")} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : product ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  )
}
