"use client"

import { Menu, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import UserMenu from "@/components/dashboard/UserMenu"

interface DashboardHeaderProps {
  onMenuClick: () => void
  notifications?: number
}

export default function DashboardHeader({ onMenuClick, notifications = 0 }: DashboardHeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-4 md:px-6">
      <div className="flex items-center gap-4 w-full">
        {/* Botón de menú móvil */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <div className="flex-1"></div>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
            <span className="sr-only">Notificaciones</span>
          </Button>

          <UserMenu />
        </div>
      </div>
    </header>
  )
}
