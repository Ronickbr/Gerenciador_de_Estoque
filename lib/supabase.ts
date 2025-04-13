import { createClient } from "@supabase/supabase-js"

// Tipos para as tabelas do Supabase
export type Manufacturer = {
  id: string
  name: string
  created_at?: string
}

export type Product = {
  id: string
  name: string
  manufacturer_id: string
  stock: number
  created_at?: string
  updated_at?: string
}

export type InventoryMovement = {
  id: string
  product_id: string
  type: "entrada" | "saida"
  quantity: number
  notes?: string | null
  created_at?: string
}

// Criação do cliente para o servidor
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_ANON_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

// Singleton para o cliente no lado do cliente
let clientSupabaseClient: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (clientSupabaseClient) return clientSupabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  clientSupabaseClient = createClient(supabaseUrl, supabaseKey)
  return clientSupabaseClient
}
