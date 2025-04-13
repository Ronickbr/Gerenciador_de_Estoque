"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createProduct } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type Manufacturer = {
  id: string
  name: string
}

type ProductItem = {
  id: string
  name: string
  stock: string
}

export function MultiProductForm({ manufacturers }: { manufacturers: Manufacturer[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [manufacturerId, setManufacturerId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"manufacturer" | "products">("manufacturer")

  // Estado para armazenar múltiplos produtos
  const [products, setProducts] = useState<ProductItem[]>([{ id: crypto.randomUUID(), name: "", stock: "0" }])

  // Função para adicionar um novo produto
  const addProduct = () => {
    setProducts([...products, { id: crypto.randomUUID(), name: "", stock: "0" }])
  }

  // Função para remover um produto
  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter((product) => product.id !== id))
    }
  }

  // Função para atualizar um produto
  const updateProduct = (id: string, field: keyof ProductItem, value: string) => {
    setProducts(products.map((product) => (product.id === id ? { ...product, [field]: value } : product)))
  }

  // Função para avançar para a etapa de produtos
  const handleNextStep = () => {
    if (!manufacturerId) {
      toast({
        variant: "destructive",
        title: "Fabricante não selecionado",
        description: "Por favor, selecione um fabricante para continuar.",
      })
      return
    }
    setStep("products")
  }

  // Função para voltar para a etapa de seleção de fabricante
  const handleBackStep = () => {
    setStep("manufacturer")
  }

  // Função para enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validar todos os produtos
      const invalidProducts = products.filter((product) => !product.name || Number(product.stock) < 0)

      if (invalidProducts.length > 0) {
        toast({
          variant: "destructive",
          title: "Dados inválidos",
          description: "Todos os produtos precisam ter um nome e quantidade válida.",
        })
        setIsLoading(false)
        return
      }

      // Criar todos os produtos
      for (const product of products) {
        await createProduct({
          name: product.name,
          manufacturerId,
          stock: Number.parseInt(product.stock),
        })
      }

      toast({
        title: "Produtos criados",
        description: `${products.length} produto(s) foram adicionados com sucesso.`,
      })

      // Redirecionar para a lista de produtos
      router.push("/produtos")
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar os produtos.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Renderizar a etapa de seleção de fabricante
  if (step === "manufacturer") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="manufacturer">Selecione o Fabricante</Label>
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

        <div className="flex justify-end">
          <Button onClick={handleNextStep}>Continuar</Button>
        </div>
      </div>
    )
  }

  // Renderizar a etapa de adição de produtos
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">
            Fabricante: {manufacturers.find((m) => m.id === manufacturerId)?.name}
          </h3>
          <p className="text-sm text-muted-foreground">Adicione os produtos para este fabricante</p>
        </div>
        <Button type="button" variant="outline" onClick={handleBackStep}>
          Alterar Fabricante
        </Button>
      </div>

      <Separator />

      {products.map((product, index) => (
        <Card key={product.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-12">
              <div className="md:col-span-7 space-y-2">
                <Label htmlFor={`name-${product.id}`}>Nome do Produto</Label>
                <Input
                  id={`name-${product.id}`}
                  value={product.name}
                  onChange={(e) => updateProduct(product.id, "name", e.target.value)}
                  placeholder="Digite o nome do produto"
                  required
                />
              </div>

              <div className="md:col-span-3 space-y-2">
                <Label htmlFor={`stock-${product.id}`}>Estoque Inicial</Label>
                <Input
                  id={`stock-${product.id}`}
                  type="number"
                  min="0"
                  value={product.stock}
                  onChange={(e) => updateProduct(product.id, "stock", e.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2 flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProduct(product.id)}
                  disabled={products.length === 1}
                  className="w-full h-10"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remover produto</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={addProduct} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar mais um produto
        </Button>

        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={() => router.push("/produtos")} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Todos os Produtos"}
          </Button>
        </div>
      </div>
    </form>
  )
}
