"use client"

import { usePathname } from "next/navigation"
import Logo from "@/components/common/Logo"
import { NavItems } from "@/components/dashboard/NavItems"

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={`hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Logo href="/dashboard" />
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <NavItems pathname={pathname} />
      </nav>
    </aside>
  )
}
