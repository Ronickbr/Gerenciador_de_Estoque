import FileSaver from "file-saver"
import * as XLSX from "xlsx"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Tipo para os dados de movimentação
type InventoryMovement = {
  id: string
  productName: string
  manufacturerName?: string
  type: "entrada" | "saida"
  quantity: number
  date: string
  notes: string | null
}

// Função para exportar para Excel
export function exportToExcel(data: InventoryMovement[], fileName: string) {
  // Formatar os dados para o Excel
  const formattedData = data.map((item) => ({
    Data: format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR }),
    Produto: item.productName,
    Fabricante: item.manufacturerName || "Desconhecido",
    Tipo: item.type === "entrada" ? "Entrada" : "Saída",
    Quantidade: item.quantity,
    Observações: item.notes || "",
  }))

  // Criar uma planilha
  const worksheet = XLSX.utils.json_to_sheet(formattedData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Movimentações")

  // Gerar o arquivo e fazer o download
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  FileSaver.saveAs(blob, `${fileName}.xlsx`)
}

// Função para preparar a impressão
export function printData(data: InventoryMovement[]) {
  // Criar uma nova janela para impressão
  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  // Estilo para a página de impressão
  const style = `
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1 { text-align: center; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      .entrada { color: green; }
      .saida { color: red; }
      @media print {
        button { display: none; }
      }
    </style>
  `

  // Formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "dd/MM/yyyy", { locale: ptBR })
  }

  // Criar o conteúdo HTML
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Relatório de Movimentação de Estoque</title>
      ${style}
    </head>
    <body>
      <h1>Relatório de Movimentação de Estoque</h1>
      <p>Data de geração: ${format(new Date(), "dd/MM/yyyy", { locale: ptBR })}</p>
      <button onclick="window.print()">Imprimir</button>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Produto</th>
            <th>Fabricante</th>
            <th>Tipo</th>
            <th>Quantidade</th>
            <th>Observações</th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (item) => `
            <tr>
              <td>${formatDate(item.date)}</td>
              <td>${item.productName}</td>
              <td>${item.manufacturerName || "Desconhecido"}</td>
              <td class="${item.type}">${item.type === "entrada" ? "Entrada" : "Saída"}</td>
              <td>${item.quantity}</td>
              <td>${item.notes || ""}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </body>
    </html>
  `

  // Escrever o conteúdo na nova janela e imprimir
  printWindow.document.open()
  printWindow.document.write(content)
  printWindow.document.close()
}
