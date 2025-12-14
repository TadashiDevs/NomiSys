"use client"

import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Logo from "@/components/common/Logo"
import { NavItems } from "@/components/dashboard/NavItems"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname()

  if (!isOpen) return null

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-black/50">
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 p-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Logo href="/dashboard" />
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavItems
            pathname={pathname}
            onClick={() => onClose()}
          />
        </nav>
      </div>
    </div>
  )
}
