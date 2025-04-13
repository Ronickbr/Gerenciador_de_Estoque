"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "./supabase"

// Ações de fabricantes
export async function createManufacturer(data: { name: string }) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("manufacturers").insert([{ name: data.name }])

  if (error) throw new Error(error.message)

  revalidatePath("/fabricantes")
  return { success: true }
}

export async function updateManufacturer(id: string, data: { name: string }) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("manufacturers").update({ name: data.name }).eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/fabricantes")
  return { success: true }
}

export async function deleteManufacturer(id: string) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("manufacturers").delete().eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/fabricantes")
  return { success: true }
}

// Ações de produtos
export async function createProduct(data: {
  name: string
  manufacturerId: string
  stock: number
}) {
  const supabase = createServerSupabaseClient()

  // Inserir o produto
  const { data: newProduct, error } = await supabase
    .from("products")
    .insert([
      {
        name: data.name,
        manufacturer_id: data.manufacturerId,
        stock: data.stock,
      },
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Registrar a movimentação de estoque inicial
  if (data.stock > 0 && newProduct) {
    const { error: movementError } = await supabase.from("inventory_movements").insert([
      {
        product_id: newProduct.id,
        type: "entrada",
        quantity: data.stock,
        notes: "Estoque inicial",
      },
    ])

    if (movementError) throw new Error(movementError.message)
  }

  revalidatePath("/produtos")
  return { success: true }
}

export async function updateProduct(
  id: string,
  data: {
    name: string
    manufacturerId: string
    stock: number
  },
) {
  const supabase = createServerSupabaseClient()

  // Buscar o produto atual para comparar o estoque
  const { data: currentProduct } = await supabase.from("products").select("stock").eq("id", id).single()

  if (!currentProduct) throw new Error("Produto não encontrado")

  // Calcular a diferença de estoque
  const stockDifference = data.stock - currentProduct.stock

  // Atualizar o produto
  const { error } = await supabase
    .from("products")
    .update({
      name: data.name,
      manufacturer_id: data.manufacturerId,
      stock: data.stock,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) throw new Error(error.message)

  // Registrar a movimentação de estoque se houver alteração
  if (stockDifference !== 0) {
    const { error: movementError } = await supabase.from("inventory_movements").insert([
      {
        product_id: id,
        type: stockDifference > 0 ? "entrada" : "saida",
        quantity: Math.abs(stockDifference),
        notes: "Ajuste de estoque",
      },
    ])

    if (movementError) throw new Error(movementError.message)
  }

  revalidatePath("/produtos")
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/produtos")
  return { success: true }
}

// Ações de movimentação de estoque
export async function createInventoryMovement(data: {
  productId: string
  type: "entrada" | "saida"
  quantity: number
  notes?: string
  date?: Date
}) {
  const supabase = createServerSupabaseClient()

  // Buscar o produto atual
  const { data: product } = await supabase.from("products").select("stock").eq("id", data.productId).single()

  if (!product) throw new Error("Produto não encontrado")

  // Calcular o novo estoque
  let newStock = product.stock
  if (data.type === "entrada") {
    newStock += data.quantity
  } else {
    newStock -= data.quantity
    // Verificar se há estoque suficiente
    if (newStock < 0) {
      throw new Error("Estoque insuficiente para esta saída")
    }
  }

  // Definir a data da movimentação (usar a data fornecida ou a data atual)
  const movementDate = data.date ? data.date.toISOString() : new Date().toISOString()

  // 1. Registrar a movimentação
  const { error: movementError } = await supabase.from("inventory_movements").insert([
    {
      product_id: data.productId,
      type: data.type,
      quantity: data.quantity,
      notes: data.notes || null,
      created_at: movementDate,
    },
  ])

  if (movementError) throw new Error(movementError.message)

  // 2. Atualizar o estoque do produto
  const { error: productError } = await supabase
    .from("products")
    .update({
      stock: newStock,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.productId)

  if (productError) throw new Error(productError.message)

  revalidatePath("/produtos")
  revalidatePath("/relatorio")
  revalidatePath("/dashboard")
  return { success: true }
}

// Função para criar backup do banco de dados
export async function createBackup() {
  const supabase = createServerSupabaseClient()

  // Buscar todos os fabricantes
  const { data: manufacturers, error: manufacturersError } = await supabase
    .from("manufacturers")
    .select("*")
    .order("name")

  if (manufacturersError) throw new Error(manufacturersError.message)

  // Buscar todos os produtos
  const { data: products, error: productsError } = await supabase.from("products").select("*").order("name")

  if (productsError) throw new Error(productsError.message)

  // Buscar todas as movimentações
  const { data: movements, error: movementsError } = await supabase
    .from("inventory_movements")
    .select("*")
    .order("created_at", { ascending: false })

  if (movementsError) throw new Error(movementsError.message)

  // Criar objeto de backup
  const backupData = {
    version: "1.0",
    date: new Date().toISOString(),
    manufacturers: manufacturers || [],
    products: products || [],
    movements: movements || [],
  }

  return backupData
}

// Ações de autenticação
export async function login(username: string, password: string) {
  const authModule = await import("./auth")
  return authModule.login(username, password)
}

export async function logout() {
  const authModule = await import("./auth")
  return authModule.logout()
}
