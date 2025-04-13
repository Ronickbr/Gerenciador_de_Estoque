"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createManufacturer, updateManufacturer } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

type Manufacturer = {
  id: string
  name: string
}

export function ManufacturerForm({ manufacturer }: { manufacturer?: Manufacturer }) {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState(manufacturer?.name || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (manufacturer) {
        await updateManufacturer(manufacturer.id, { name })
        toast({
          title: "Fabricante atualizado",
          description: "As alterações foram salvas com sucesso.",
        })
      } else {
        await createManufacturer({ name })
        toast({
          title: "Fabricante criado",
          description: "O novo fabricante foi adicionado com sucesso.",
        })
      }
      router.push("/fabricantes")
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar o fabricante.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Fabricante</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite o nome do fabricante"
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => router.push("/fabricantes")} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : manufacturer ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  )
}
