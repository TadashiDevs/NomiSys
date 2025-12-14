"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SmoothScrollLink } from "@/components/smooth-scroll-link"
import Logo from "@/components/common/Logo"

interface HeaderProps {
  scrolled: boolean
}

export default function Header({ scrolled }: HeaderProps) {
  return (
    <header
      className={`w-full ${
        scrolled ? "py-2" : "py-4"
      } px-6 md:px-12 flex justify-between items-center border-b border-gray-100/50 dark:border-gray-800/50 ${
        scrolled
          ? "bg-white/60 dark:bg-gray-950/60 shadow-md"
          : "bg-white/40 dark:bg-gray-950/40 shadow-sm"
      } backdrop-blur-md fixed top-0 left-0 right-0 z-50 transition-all duration-300`}
    >
      <Logo href="/" />

      {/* Navigation Menu - Desktop */}
      <nav className="hidden md:flex items-center gap-8">
        <SmoothScrollLink href="#inicio" className="text-sm font-medium hover:text-blue-600 transition-colors">
          Inicio
        </SmoothScrollLink>
        <SmoothScrollLink href="#caracteristicas" className="text-sm font-medium hover:text-blue-600 transition-colors">
          Características
        </SmoothScrollLink>
        <SmoothScrollLink href="#funcionalidades" className="text-sm font-medium hover:text-blue-600 transition-colors">
          Funcionalidades
        </SmoothScrollLink>
        <SmoothScrollLink href="#contacto" className="text-sm font-medium hover:text-blue-600 transition-colors">
          Contacto
        </SmoothScrollLink>
      </nav>

      <div className="flex gap-4">
        <Link href="/login">
          <Button variant="outline" className="relative">
            <motion.span
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(59, 130, 246, 0)",
                  "0 0 0 4px rgba(59, 130, 246, 0.3)",
                  "0 0 0 0 rgba(59, 130, 246, 0)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
              }}
              className="absolute inset-0 rounded-md"
            />
            Iniciar Sesión
          </Button>
        </Link>
        <Link href="/register" className="hidden md:block">
          <Button>Registrarse</Button>
        </Link>
      </div>
    </header>
  )
}
