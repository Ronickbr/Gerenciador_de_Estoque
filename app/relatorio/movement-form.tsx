"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createInventoryMovement } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Plus, Trash2, CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

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

type MovementItem = {
  id: string
  productId: string
  quantity: string
  type: "entrada" | "saida"
  notes: string
  date: Date
}

export function MovementForm({
  products,
  manufacturers,
  onSuccess,
}: {
  products: Product[]
  manufacturers: Manufacturer[]
  onSuccess?: () => void
}) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedManufacturerId, setSelectedManufacturerId] = useState<string>("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)

  // Estado para gerenciar múltiplos itens
  const [items, setItems] = useState<MovementItem[]>([
    {
      id: crypto.randomUUID(),
      productId: "",
      quantity: "1",
      type: "entrada",
      notes: "",
      date: new Date(),
    },
  ])

  // Filtrar produtos quando o fabricante é selecionado
  useEffect(() => {
    if (selectedManufacturerId && selectedManufacturerId !== "all") {
      setFilteredProducts(products.filter((product) => product.manufacturerId === selectedManufacturerId))
    } else {
      setFilteredProducts(products)
    }
  }, [selectedManufacturerId, products])

  // Função para adicionar um novo item
  const addItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        productId: "",
        quantity: "1",
        type: "entrada",
        notes: "",
        date: new Date(),
      },
    ])
  }

  // Função para remover um item
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  // Função para atualizar um item
  const updateItem = (id: string, field: keyof MovementItem, value: any) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  // Verificar se um produto tem estoque suficiente para saída
  const hasEnoughStock = (productId: string, quantity: number, type: string) => {
    if (type !== "saida") return true

    const product = products.find((p) => p.id === productId)
    return product ? product.stock >= quantity : false
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validar todos os itens
      for (const item of items) {
        if (!item.productId) {
          toast({
            variant: "destructive",
            title: "Produto não selecionado",
            description: "Selecione um produto para cada item.",
          })
          setIsLoading(false)
          return
        }

        const quantity = Number.parseInt(item.quantity)
        if (isNaN(quantity) || quantity <= 0) {
          toast({
            variant: "destructive",
            title: "Quantidade inválida",
            description: "A quantidade deve ser um número maior que zero.",
          })
          setIsLoading(false)
          return
        }

        // Verificar estoque para saídas
        if (!hasEnoughStock(item.productId, quantity, item.type)) {
          const product = products.find((p) => p.id === item.productId)
          toast({
            variant: "destructive",
            title: "Estoque insuficiente",
            description: `O produto ${product?.name} possui apenas ${product?.stock} unidades em estoque.`,
          })
          setIsLoading(false)
          return
        }
      }

      // Processar todos os itens
      for (const item of items) {
        await createInventoryMovement({
          productId: item.productId,
          type: item.type,
          quantity: Number.parseInt(item.quantity),
          notes: item.notes.trim() || undefined,
          date: item.date,
        })
      }

      toast({
        title: "Movimentações registradas",
        description: `${items.length} movimentação(ões) registrada(s) com sucesso.`,
      })

      // Limpar o formulário
      setItems([
        {
          id: crypto.randomUUID(),
          productId: "",
          quantity: "1",
          type: "entrada",
          notes: "",
          date: new Date(),
        },
      ])
      setSelectedManufacturerId("")

      // Chamar o callback de sucesso, se fornecido
      if (onSuccess) {
        onSuccess()
      }

      // Atualizar a página
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Ocorreu um erro ao registrar as movimentações.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <Label>Fabricante</Label>
        <Select value={selectedManufacturerId} onValueChange={setSelectedManufacturerId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um fabricante (opcional)" />
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
        <p className="text-xs text-muted-foreground mt-1">
          Selecione um fabricante para filtrar os produtos disponíveis
        </p>
      </div>

      <div className="hidden md:grid md:grid-cols-12 gap-2 items-center font-medium text-sm mb-2">
        <div className="md:col-span-3">Produto</div>
        <div className="md:col-span-2">Quantidade</div>
        <div className="md:col-span-2">Tipo</div>
        <div className="md:col-span-2">Data</div>
        <div className="md:col-span-2">Observações</div>
        <div className="md:col-span-1"></div>
      </div>

      {items.map((item, index) => (
        <div
          key={item.id}
          className="space-y-4 md:space-y-0 md:grid md:grid-cols-12 gap-2 items-start md:items-center border p-3 rounded-md md:border-0 md:p-0"
        >
          <div className="md:col-span-3">
            <div className="block md:hidden font-medium text-sm mb-1">Produto</div>
            <Select value={item.productId} onValueChange={(value) => updateItem(item.id, "productId", value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {filteredProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} ({product.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <div className="block md:hidden font-medium text-sm mb-1">Quantidade</div>
            <Input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <div className="block md:hidden font-medium text-sm mb-1">Tipo</div>
            <Select
              value={item.type}
              onValueChange={(value: "entrada" | "saida") => updateItem(item.id, "type", value)}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <div className="block md:hidden font-medium text-sm mb-1">Data</div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !item.date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {item.date ? format(item.date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={item.date}
                  onSelect={(date) => updateItem(item.id, "date", date || new Date())}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="md:col-span-2">
            <div className="block md:hidden font-medium text-sm mb-1">Observações</div>
            <Input
              placeholder="Observações"
              value={item.notes}
              onChange={(e) => updateItem(item.id, "notes", e.target.value)}
            />
          </div>

          <div className="md:col-span-1 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(item.id)}
              disabled={items.length === 1}
              className="h-10 w-10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remover item</span>
            </Button>
          </div>
        </div>
      ))}

      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="flex items-center">
          <Plus className="h-4 w-4 mr-1" />
          Adicionar produto
        </Button>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Registrando..." : "Registrar Movimentações"}
        </Button>
      </div>
    </form>
  )
}
