"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Suspense } from "react"
import { Users, FileText, Calculator, Search, Menu, LogOut, User, ChevronDown, Home, X } from "lucide-react"
import Logo from "@/components/common/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authApi } from "@/services/api"
import { NotificationProvider } from "@/context/NotificationContext"
import { NotificationBell } from "@/components/dashboard/NotificationBell"
import { ContractExpirationChecker } from "@/components/dashboard/ContractExpirationChecker"
import { LoginSuccessChecker } from "@/components/dashboard/LoginSuccessChecker"
import { ToastNotificationProvider } from "@/context/ToastNotificationContext"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  // Ya no necesitamos este estado, ahora usamos el contexto de notificaciones

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    if (!authApi.isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    // Llamar a la función de cierre de sesión del servicio de autenticación
    authApi.logout()
    router.push("/login")
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Trabajadores",
      href: "/dashboard/trabajadores",
      icon: <Users className="h-5 w-5" />,
      active: true,
    },
    {
      name: "Contratos",
      href: "/dashboard/contratos",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Nóminas",
      href: "/dashboard/nominas",
      icon: <Calculator className="h-5 w-5" />,
      disabled: false,
    },
  ]

  return (
    <NotificationProvider>
      <ToastNotificationProvider>
        <ContractExpirationChecker />
        <LoginSuccessChecker />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Logo href="/dashboard" size="medium" />
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.disabled ? "#" : item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                pathname === item.href
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={(e) => {
                if (item.disabled) e.preventDefault()
              }}
            >
              {item.icon}
              <span>{item.name}</span>
              {item.active && <span className="ml-auto w-2 h-2 rounded-full bg-blue-600" />}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-4 md:px-6">
          <div className="flex items-center gap-4 w-full">
            {/* Botón de menú móvil */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>

            <div className="flex-1"></div>

            <div className="flex items-center gap-2 ml-auto">
              <NotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt="Avatar" />
                      <AvatarFallback>AP</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50">
            <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 p-0 overflow-y-auto">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <Logo href="/dashboard" size="medium" />
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.disabled ? "#" : item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      pathname === item.href
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={(e) => {
                      if (item.disabled) e.preventDefault()
                      else setIsMobileMenuOpen(false)
                    }}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                    {item.active && <span className="ml-auto w-2 h-2 rounded-full bg-blue-600" />}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </main>
      </div>
    </div>
      </ToastNotificationProvider>
    </NotificationProvider>
  )
}
