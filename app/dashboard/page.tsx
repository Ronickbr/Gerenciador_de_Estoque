import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardData } from "@/lib/data"
import { AlertCircle, ArrowUp, Calendar } from "lucide-react"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const {
    dailySales,
    weeklySales,
    monthlySales,
    topDailyProducts,
    topWeeklyProducts,
    topMonthlyProducts,
    lowStockProducts,
    bestSellingDay,
  } = await getDashboardData()

  return (
    <div className="p-6 space-y-6 pt-16 md:pt-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <ArrowUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailySales}</div>
            <p className="text-xs text-muted-foreground">Produtos vendidos nas últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendas na Semana</CardTitle>
            <ArrowUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklySales}</div>
            <p className="text-xs text-muted-foreground">Produtos vendidos nos últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendas no Mês</CardTitle>
            <ArrowUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlySales}</div>
            <p className="text-xs text-muted-foreground">Produtos vendidos nos últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dia com Mais Vendas</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestSellingDay.day}</div>
            <p className="text-xs text-muted-foreground">{bestSellingDay.count} produtos vendidos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos (Hoje)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {topDailyProducts.map((product) => (
                <li key={product.id} className="flex justify-between items-center">
                  <span>{product.name}</span>
                  <span className="font-medium">{product.count} unidades</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos (Semana)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {topWeeklyProducts.map((product) => (
                <li key={product.id} className="flex justify-between items-center">
                  <span>{product.name}</span>
                  <span className="font-medium">{product.count} unidades</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos (Mês)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {topMonthlyProducts.map((product) => (
                <li key={product.id} className="flex justify-between items-center">
                  <span>{product.name}</span>
                  <span className="font-medium">{product.count} unidades</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-red-500">
            <AlertCircle className="mr-2 h-5 w-5" />
            Alerta de Estoque Baixo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockProducts.length === 0 ? (
            <p>Não há produtos com estoque baixo.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {lowStockProducts.map((manufacturer) => (
                <Card key={manufacturer.id} className="border-red-100">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium border-b border-dashed pb-1">
                      {manufacturer.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <ul className="space-y-1">
                      {manufacturer.products.map((product) => (
                        <li key={product.id} className="flex justify-between items-center text-sm">
                          <span>{product.name}</span>
                          <span className="font-medium text-red-500">{product.stock} unidades</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
