"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section id="inicio" className="py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Gestiona tu nómina con precisión y sin complicaciones
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            NomiSys te permite automatizar pagos, gestionar empleados y asegurar el cumplimiento legal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login">
              <Button size="lg" className="px-8">
                Comenzar ahora
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 z-10 rounded-xl"></div>
          <Image
            src="/images/hero-illustration.svg"
            alt="Gestión de nómina"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </div>
    </section>
  )
}
