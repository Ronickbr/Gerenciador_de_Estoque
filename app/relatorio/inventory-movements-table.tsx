"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type InventoryMovement = {
  id: string
  productId?: string
  productName: string
  type: "entrada" | "saida"
  quantity: number
  date: string
  notes: string | null
  manufacturerId?: string
  manufacturerName?: string
}

type InventoryMovementsTableProps = {
  movements: InventoryMovement[]
}

export function InventoryMovementsTable({ movements }: InventoryMovementsTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "dd/MM/yyyy", { locale: ptBR })
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Data</TableHead>
            <TableHead className="whitespace-nowrap">Produto</TableHead>
            <TableHead className="whitespace-nowrap">Fabricante</TableHead>
            <TableHead className="whitespace-nowrap">Tipo</TableHead>
            <TableHead className="whitespace-nowrap">Quantidade</TableHead>
            <TableHead className="whitespace-nowrap">Observações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Nenhuma movimentação encontrada
              </TableCell>
            </TableRow>
          ) : (
            movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell className="whitespace-nowrap">{formatDate(movement.date)}</TableCell>
                <TableCell className="font-medium">{movement.productName}</TableCell>
                <TableCell>{movement.manufacturerName || "-"}</TableCell>
                <TableCell>
                  {movement.type === "entrada" ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Entrada
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Saída
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{movement.quantity}</TableCell>
                <TableCell>{movement.notes || "-"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
