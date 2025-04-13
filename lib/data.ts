"use server"

import { createServerSupabaseClient } from "./supabase"

// Dados do dashboard
export async function getDashboardData() {
  const supabase = createServerSupabaseClient()
  const now = new Date()

  // Datas para filtros
  const dayStart = new Date(now)
  dayStart.setHours(0, 0, 0, 0)

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 7)
  weekStart.setHours(0, 0, 0, 0)

  const monthStart = new Date(now)
  monthStart.setDate(now.getDate() - 30)
  monthStart.setHours(0, 0, 0, 0)

  // Buscar todas as movimentações
  const { data: movements } = await supabase
    .from("inventory_movements")
    .select(`
      id,
      product_id,
      type,
      quantity,
      created_at,
      notes,
      products(name)
    `)
    .order("created_at", { ascending: false })

  if (!movements) {
    return {
      dailySales: 0,
      weeklySales: 0,
      monthlySales: 0,
      topDailyProducts: [],
      topWeeklyProducts: [],
      topMonthlyProducts: [],
      lowStockProducts: [],
      bestSellingDay: { day: "Sem dados", count: 0 },
    }
  }

  // Formatar os dados das movimentações
  const formattedMovements = movements.map((m) => ({
    id: m.id,
    productId: m.product_id,
    productName: m.products?.name || "Produto Desconhecido",
    type: m.type as "entrada" | "saida",
    quantity: m.quantity,
    date: m.created_at,
    notes: m.notes,
  }))

  // Filtrar movimentações por tipo e data
  const dailySales = formattedMovements
    .filter((m) => m.type === "saida" && new Date(m.date) >= dayStart)
    .reduce((sum, m) => sum + m.quantity, 0)

  const weeklySales = formattedMovements
    .filter((m) => m.type === "saida" && new Date(m.date) >= weekStart)
    .reduce((sum, m) => sum + m.quantity, 0)

  const monthlySales = formattedMovements
    .filter((m) => m.type === "saida" && new Date(m.date) >= monthStart)
    .reduce((sum, m) => sum + m.quantity, 0)

  // Obter produtos mais vendidos por período
  const dailyProductSales = getTopProductsByPeriod(formattedMovements, dayStart)
  const weeklyProductSales = getTopProductsByPeriod(formattedMovements, weekStart)
  const monthlyProductSales = getTopProductsByPeriod(formattedMovements, monthStart)

  // Obter produtos com estoque baixo agrupados por fabricante
  const { data: lowStockProductsRaw } = await supabase
    .from("products")
    .select("id, name, stock, manufacturer_id, manufacturers(id, name)")
    .lt("stock", 5)
    .order("manufacturer_id")

  // Agrupar produtos por fabricante
  const lowStockByManufacturer = {}

  if (lowStockProductsRaw) {
    lowStockProductsRaw.forEach((product) => {
      const manufacturerId = product.manufacturer_id
      const manufacturerName = product.manufacturers?.name || "Fabricante Desconhecido"

      if (!lowStockByManufacturer[manufacturerId]) {
        lowStockByManufacturer[manufacturerId] = {
          id: manufacturerId,
          name: manufacturerName,
          products: [],
        }
      }

      lowStockByManufacturer[manufacturerId].products.push({
        id: product.id,
        name: product.name,
        stock: product.stock,
      })
    })
  }

  // Converter o objeto em um array para facilitar o uso no componente
  const lowStockProducts = Object.values(lowStockByManufacturer)

  // Calcular o dia da semana com mais vendas (últimos 30 dias)
  const bestSellingDay = getBestSellingDay(formattedMovements, monthStart)

  return {
    dailySales,
    weeklySales,
    monthlySales,
    topDailyProducts: dailyProductSales.slice(0, 5),
    topWeeklyProducts: weeklyProductSales.slice(0, 5),
    topMonthlyProducts: monthlyProductSales.slice(0, 5),
    lowStockProducts: lowStockProducts || [],
    bestSellingDay,
  }
}

function getTopProductsByPeriod(movements, startDate) {
  const salesByProduct = {}

  movements
    .filter((m) => m.type === "saida" && new Date(m.date) >= startDate)
    .forEach((m) => {
      if (!salesByProduct[m.productId]) {
        salesByProduct[m.productId] = {
          id: m.productId,
          name: m.productName,
          count: 0,
        }
      }
      salesByProduct[m.productId].count += m.quantity
    })

  return Object.values(salesByProduct).sort((a, b) => b.count - a.count)
}

// Função para obter o dia da semana com mais vendas
function getBestSellingDay(movements, startDate) {
  const weekdays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]

  // Inicializar contador para cada dia da semana
  const salesByDay = {
    0: 0, // Domingo
    1: 0, // Segunda
    2: 0, // Terça
    3: 0, // Quarta
    4: 0, // Quinta
    5: 0, // Sexta
    6: 0, // Sábado
  }

  // Filtrar movimentações de saída no período e contar por dia da semana
  movements
    .filter((m) => m.type === "saida" && new Date(m.date) >= startDate)
    .forEach((m) => {
      const date = new Date(m.date)
      const dayOfWeek = date.getDay() // 0-6, onde 0 é domingo
      salesByDay[dayOfWeek] += m.quantity
    })

  // Encontrar o dia com mais vendas
  let bestDay = 0
  let maxSales = 0

  for (let day = 0; day < 7; day++) {
    if (salesByDay[day] > maxSales) {
      maxSales = salesByDay[day]
      bestDay = day
    }
  }

  return {
    day: weekdays[bestDay],
    count: maxSales,
  }
}

// Dados de fabricantes
export async function getManufacturers() {
  const supabase = createServerSupabaseClient()

  const { data: manufacturers } = await supabase.from("manufacturers").select("*")

  if (!manufacturers) return []

  // Buscar a contagem de produtos para cada fabricante
  const manufacturersWithCount = await Promise.all(
    manufacturers.map(async (manufacturer) => {
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("manufacturer_id", manufacturer.id)

      return {
        id: manufacturer.id,
        name: manufacturer.name,
        productCount: count || 0,
      }
    }),
  )

  return manufacturersWithCount
}

export async function getManufacturerById(id: string) {
  const supabase = createServerSupabaseClient()

  const { data } = await supabase.from("manufacturers").select("*").eq("id", id).single()

  return data
}

// Dados de produtos
export async function getProducts(filters?: {
  name?: string
  manufacturer?: string
  stock?: string
}) {
  const supabase = createServerSupabaseClient()

  let query = supabase.from("products").select(`
    *,
    manufacturers(name)
  `)

  // Aplicar filtros
  if (filters?.name) {
    query = query.ilike("name", `%${filters.name}%`)
  }

  if (filters?.manufacturer && filters.manufacturer !== "all") {
    query = query.eq("manufacturer_id", filters.manufacturer)
  }

  if (filters?.stock) {
    switch (filters.stock) {
      case "low":
        query = query.lt("stock", 5)
        break
      case "medium":
        query = query.gte("stock", 5).lte("stock", 20)
        break
      case "high":
        query = query.gt("stock", 20)
        break
    }
  }

  const { data } = await query

  if (!data) return []

  return data.map((p) => ({
    id: p.id,
    name: p.name,
    manufacturerId: p.manufacturer_id,
    manufacturerName: p.manufacturers?.name || "Desconhecido",
    stock: p.stock,
  }))
}

export async function getProductById(id: string) {
  const supabase = createServerSupabaseClient()

  const { data } = await supabase.from("products").select("*").eq("id", id).single()

  return data
}

// Dados de movimentações de estoque
export async function getInventoryMovements() {
  const supabase = createServerSupabaseClient()

  const { data } = await supabase
    .from("inventory_movements")
    .select(`
      *,
      products(
        name, 
        manufacturer_id,
        manufacturers(name)
      )
    `)
    .order("created_at", { ascending: false })

  if (!data) return []

  return data.map((m) => ({
    id: m.id,
    productId: m.product_id,
    productName: m.products?.name || "Produto Desconhecido",
    manufacturerId: m.products?.manufacturer_id,
    manufacturerName: m.products?.manufacturers?.name || "Desconhecido",
    type: m.type as "entrada" | "saida",
    quantity: m.quantity,
    date: m.created_at,
    notes: m.notes,
  }))
}

// Obter todos os produtos para o formulário de movimentação
export async function getAllProducts() {
  const supabase = createServerSupabaseClient()

  const { data } = await supabase.from("products").select("id, name, stock, manufacturer_id").order("name")

  return data
    ? data.map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        manufacturerId: p.manufacturer_id,
      }))
    : []
}
