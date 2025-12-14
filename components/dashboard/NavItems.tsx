"use client"

import Link from "next/link"
import { Home, Users, FileText, Calculator } from "lucide-react"
import { ReactNode } from "react"

interface NavItem {
  name: string
  href: string
  icon: ReactNode
  active?: boolean
  disabled?: boolean
}

interface NavItemsProps {
  pathname: string
  onClick?: (item: NavItem) => void
}

export const navItems: NavItem[] = [
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

export function NavItems({ pathname, onClick }: NavItemsProps) {
  return (
    <>
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
            if (item.disabled) {
              e.preventDefault()
            } else if (onClick) {
              onClick(item)
            }
          }}
        >
          {item.icon}
          <span>{item.name}</span>
          {item.active && <span className="ml-auto w-2 h-2 rounded-full bg-blue-600" />}
        </Link>
      ))}
    </>
  )
}
