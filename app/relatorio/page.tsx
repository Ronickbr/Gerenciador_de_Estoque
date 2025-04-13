import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getInventoryMovements, getAllProducts, getManufacturers } from "@/lib/data"
import { ReportClient } from "./report-client"

export default async function ReportPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const movements = await getInventoryMovements()
  const products = await getAllProducts()
  const manufacturers = await getManufacturers()

  return <ReportClient initialMovements={movements} products={products} manufacturers={manufacturers} />
}
