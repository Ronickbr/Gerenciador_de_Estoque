"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Database, Download, Loader2 } from "lucide-react"
import { createBackup } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

export function BackupClient() {
  const [isLoading, setIsLoading] = useState(false)
  const [backupData, setBackupData] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const handleBackup = async () => {
    setIsLoading(true)
    setBackupData(null)
    setProgress(10)

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      const data = await createBackup()
      clearInterval(progressInterval)
      setProgress(100)
      setBackupData(data)

      toast({
        title: "Backup concluído",
        description: "O backup do banco de dados foi concluído com sucesso.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar backup",
        description: "Ocorreu um erro ao criar o backup do banco de dados.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!backupData) return

    // Criar um blob com os dados do backup
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    // Criar um link para download e clicar nele
    const a = document.createElement("a")
    a.href = url
    a.download = `backup-sistema-estoque-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()

    // Limpar
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Download iniciado",
      description: "O download do arquivo de backup foi iniciado.",
    })
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Informação importante</AlertTitle>
        <AlertDescription>
          O backup irá exportar todos os dados do sistema em um arquivo JSON. Este arquivo pode ser usado para restaurar
          o sistema em caso de perda de dados.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleBackup} disabled={isLoading} className="flex items-center gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Gerando backup...</span>
            </>
          ) : (
            <>
              <Database className="h-4 w-4" />
              <span>Gerar backup</span>
            </>
          )}
        </Button>

        {backupData && (
          <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Baixar arquivo</span>
          </Button>
        )}
      </div>

      {isLoading && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {backupData && (
        <Card className="mt-4 border-green-200">
          <CardContent className="pt-6">
            <div className="text-sm text-green-600">
              <p className="font-medium">Backup concluído com sucesso!</p>
              <p className="mt-1">
                O backup contém {backupData.manufacturers.length} fabricantes, {backupData.products.length} produtos e{" "}
                {backupData.movements.length} movimentações de estoque.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
