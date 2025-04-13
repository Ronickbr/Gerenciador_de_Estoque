import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BackupClient } from "./backup-client"

export default async function BackupPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // Verificar se o usuário é administrador
  if (session.user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="p-6 space-y-6 pt-16 md:pt-6">
      <h1 className="text-3xl font-bold">Backup do Sistema</h1>

      <Card>
        <CardHeader>
          <CardTitle>Backup do Banco de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <BackupClient />
        </CardContent>
      </Card>
    </div>
  )
}
