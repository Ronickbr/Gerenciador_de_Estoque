// This is a mock database implementation for demonstration purposes
// In a real application, you would use a real database like PostgreSQL, MySQL, etc.

import { v4 as uuidv4 } from "uuid"

// Mock data
let manufacturers = [
  { id: "1", name: "Tech Solutions" },
  { id: "2", name: "Global Industries" },
  { id: "3", name: "Innovative Products" },
]

let products = [
  { id: "1", name: "Laptop", manufacturerId: "1", stock: 15 },
  { id: "2", name: "Smartphone", manufacturerId: "1", stock: 25 },
  { id: "3", name: "Tablet", manufacturerId: "2", stock: 10 },
  { id: "4", name: "Monitor", manufacturerId: "2", stock: 5 },
  { id: "5", name: "Teclado", manufacturerId: "3", stock: 30 },
  { id: "6", name: "Mouse", manufacturerId: "3", stock: 4 },
]

const inventoryMovements = [
  {
    id: "1",
    productId: "1",
    type: "entrada" as const,
    quantity: 20,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Estoque inicial",
  },
  {
    id: "2",
    productId: "1",
    type: "saida" as const,
    quantity: 5,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Venda",
  },
  {
    id: "3",
    productId: "2",
    type: "entrada" as const,
    quantity: 30,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Estoque inicial",
  },
  {
    id: "4",
    productId: "2",
    type: "saida" as const,
    quantity: 5,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Venda",
  },
]

// Mock database operations
export const db = {
  manufacturers: {
    findAll: async () => {
      return manufacturers.map((m) => ({
        ...m,
        productCount: products.filter((p) => p.manufacturerId === m.id).length,
      }))
    },
    findById: async (id: string) => {
      return manufacturers.find((m) => m.id === id)
    },
    create: async (data: { name: string }) => {
      const newManufacturer = { id: uuidv4(), ...data }
      manufacturers.push(newManufacturer)
      return newManufacturer
    },
    update: async (id: string, data: { name: string }) => {
      const index = manufacturers.findIndex((m) => m.id === id)
      if (index === -1) throw new Error("Manufacturer not found")
      manufacturers[index] = { ...manufacturers[index], ...data }
      return manufacturers[index]
    },
    delete: async (id: string) => {
      manufacturers = manufacturers.filter((m) => m.id !== id)
      return { success: true }
    },
  },
  products: {
    findAll: async (filters?: { name?: string; manufacturerId?: string; stock?: string }) => {
      let filteredProducts = [...products]

      if (filters?.name) {
        filteredProducts = filteredProducts.filter((p) => p.name.toLowerCase().includes(filters.name!.toLowerCase()))
      }

      if (filters?.manufacturerId) {
        filteredProducts = filteredProducts.filter((p) => p.manufacturerId === filters.manufacturerId)
      }

      if (filters?.stock) {
        switch (filters.stock) {
          case "low":
            filteredProducts = filteredProducts.filter((p) => p.stock < 5)
            break
          case "medium":
            filteredProducts = filteredProducts.filter((p) => p.stock >= 5 && p.stock <= 20)
            break
          case "high":
            filteredProducts = filteredProducts.filter((p) => p.stock > 20)
            break
        }
      }

      return filteredProducts.map((p) => ({
        ...p,
        manufacturerName: manufacturers.find((m) => m.id === p.manufacturerId)?.name || "Desconhecido",
      }))
    },
    findById: async (id: string) => {
      return products.find((p) => p.id === id)
    },
    create: async (data: { name: string; manufacturerId: string; stock: number }) => {
      const newProduct = { id: uuidv4(), ...data }
      products.push(newProduct)
      return newProduct
    },
    update: async (id: string, data: { name: string; manufacturerId: string; stock: number }) => {
      const index = products.findIndex((p) => p.id === id)
      if (index === -1) throw new Error("Product not found")
      products[index] = { ...products[index], ...data }
      return products[index]
    },
    delete: async (id: string) => {
      products = products.filter((p) => p.id !== id)
      return { success: true }
    },
  },
  inventoryMovements: {
    findAll: async () => {
      return inventoryMovements
        .map((m) => ({
          ...m,
          productName: products.find((p) => p.id === m.productId)?.name || "Produto Desconhecido",
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },
    create: async (data: {
      productId: string
      type: "entrada" | "saida"
      quantity: number
      notes?: string
    }) => {
      const newMovement = {
        id: uuidv4(),
        ...data,
        date: new Date().toISOString(),
        notes: data.notes || null,
      }
      inventoryMovements.push(newMovement)
      return newMovement
    },
  },
}
