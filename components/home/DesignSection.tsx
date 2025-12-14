"use client"

import { motion } from "framer-motion"
import { Target, Palette, LineChart, Smartphone } from "lucide-react"
import FeatureCard from "./FeatureCard"

export default function DesignSection() {
  const designFeatures = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Diseño limpio",
      description: "Interfaz minimalista que facilita la navegación y el uso diario.",
      color: "blue",
      delay: 0.1,
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Colores suaves",
      description: "Paleta de colores cuidadosamente seleccionada para reducir la fatiga visual.",
      color: "green",
      delay: 0.2,
    },
    {
      icon: <LineChart className="h-6 w-6" />,
      title: "Visualización clara",
      description: "Gráficos y tablas diseñados para una comprensión inmediata de los datos.",
      color: "purple",
      delay: 0.3,
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Adaptable",
      description: "Diseño responsivo que se adapta perfectamente a cualquier dispositivo.",
      color: "red",
      delay: 0.4,
    },
  ]

  return (
    <section className="py-16 md:py-24 px-6 md:px-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Diseño intuitivo y elegante</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Una experiencia fluida y moderna para gestionar con comodidad.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {designFeatures.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
