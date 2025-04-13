"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Box, ChevronLeft, ChevronRight, Database, Factory, LogOut, Menu, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/actions"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { getSession } from "@/lib/auth"
import Image from "next/image"

export function Sidebar() {
  const pathname = usePathname()
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession()
      setSession(sessionData)
      setIsLoading(false)
    }

    fetchSession()
  }, [])

  // Don't render sidebar on login page or if not authenticated
  if (pathname === "/login" || (!session && !isLoading)) {
    return null
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
    },
    {
      name: "Fabricantes",
      href: "/fabricantes",
      icon: Factory,
    },
    {
      name: "Produtos",
      href: "/produtos",
      icon: Box,
    },
    {
      name: "Relatório",
      href: "/relatorio",
      icon: Package,
    },
    {
      name: "Backup",
      href: "/backup",
      icon: Database,
    },
  ]

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Mobile menu button - visible only on small screens */}
      <div className="fixed top-0 left-0 z-40 flex items-center p-4 md:hidden">
        <Button variant="outline" size="icon" onClick={toggleMobileMenu} className="bg-background">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-30 h-full bg-background transition-all duration-300 ease-in-out border-r",
          isCollapsed ? "w-16" : "w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-14 items-center border-b px-4 justify-between">
          <div className={cn("flex items-center", isCollapsed && "justify-center w-full")}>
            <div className="w-8 h-8 mr-2 flex-shrink-0">
              <Image
                src="https://comercialnetstore.com.br/estoque/assets/images/Suplemento.png"
                alt="Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            {!isCollapsed && <h1 className="text-lg font-semibold">Sistema de Estoque</h1>}
          </div>

          {/* Toggle button - visible only on medium screens and up */}
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    isCollapsed && "justify-center px-0",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t">
          {session && (
            <div className={cn("flex flex-col gap-2", isCollapsed && "items-center")}>
              {!isCollapsed && (
                <>
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.role}</p>
                </>
              )}
              <Button
                variant="outline"
                size={isCollapsed ? "icon" : "sm"}
                className={cn("mt-2 w-full", !isCollapsed && "justify-start", isCollapsed && "h-9 w-9")}
                onClick={handleLogout}
              >
                <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && <span>Sair</span>}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
