"use client"

import Link from "next/link"
import { SmoothScrollLink } from "@/components/smooth-scroll-link"
import Logo from "@/components/common/Logo"

export default function Footer() {
  return (
    <footer id="contacto" className="bg-gray-900 text-white py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="mb-4">
            <Logo href="/" />
          </div>
          <p className="text-gray-400 mb-4">
            Simplificando la gestión de recursos humanos y nómina.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Enlaces</h3>
          <ul className="space-y-2">
            <li><SmoothScrollLink href="#inicio" className="text-gray-400 hover:text-white transition-colors">Inicio</SmoothScrollLink></li>
            <li><SmoothScrollLink href="#caracteristicas" className="text-gray-400 hover:text-white transition-colors">Características</SmoothScrollLink></li>
            <li><SmoothScrollLink href="#funcionalidades" className="text-gray-400 hover:text-white transition-colors">Funcionalidades</SmoothScrollLink></li>
            <li><SmoothScrollLink href="#contacto" className="text-gray-400 hover:text-white transition-colors">Contacto</SmoothScrollLink></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Legal</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Términos y Condiciones</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Política de Privacidad</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Política de Cookies</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Contacto</h3>
          <ul className="space-y-2">
            <li className="text-gray-400">contacto@nomisys.com</li>
            <li className="text-gray-400">+51 987 654 321</li>
            <li className="text-gray-400">Lima, Perú</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} NomiSys. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
