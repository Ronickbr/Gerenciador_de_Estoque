"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { deleteManufacturer } from "@/lib/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

type Manufacturer = {
  id: string
  name: string
  productCount: number
}

export function ManufacturerTable({ manufacturers }: { manufacturers: Manufacturer[] }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [manufacturerToDelete, setManufacturerToDelete] = useState<Manufacturer | null>(null)
  const { toast } = useToast()

  const handleDeleteClick = (manufacturer: Manufacturer) => {
    setManufacturerToDelete(manufacturer)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!manufacturerToDelete) return

    try {
      await deleteManufacturer(manufacturerToDelete.id)
      toast({
        title: "Fabricante excluído",
        description: `${manufacturerToDelete.name} foi removido com sucesso.`,
      })
      // Refresh the page to update the list
      window.location.reload()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir o fabricante.",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setManufacturerToDelete(null)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Quantidade de Produtos</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {manufacturers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                Nenhum fabricante encontrado
              </TableCell>
            </TableRow>
          ) : (
            manufacturers.map((manufacturer) => (
              <TableRow key={manufacturer.id}>
                <TableCell className="font-medium">{manufacturer.name}</TableCell>
                <TableCell>{manufacturer.productCount}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/fabricantes/editar/${manufacturer.id}`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteClick(manufacturer)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o fabricante {manufacturerToDelete?.name}?
              {manufacturerToDelete?.productCount > 0 && (
                <span className="font-semibold text-red-500 block mt-2">
                  Atenção: Este fabricante possui {manufacturerToDelete.productCount} produtos associados.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
