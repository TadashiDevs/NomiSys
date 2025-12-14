"use client"

import { motion } from "framer-motion"
import { Clock, Users, BarChart, Shield } from "lucide-react"
import FeatureCard from "./FeatureCard"

export default function FeaturesSection() {
  const features = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Cálculo automático de nómina",
      description: "El sistema gestiona horas, descuentos y bonificaciones.",
      color: "blue",
      delay: 0.1,
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Gestión de trabajadores",
      description: "Administra datos, contratos y asignaciones.",
      color: "green",
      delay: 0.2,
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Reportes inteligentes",
      description: "Exporta reportes de pagos, asistencia y deducciones.",
      color: "purple",
      delay: 0.3,
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Seguridad y respaldo",
      description: "Datos cifrados y respaldos automáticos en la nube.",
      color: "red",
      delay: 0.4,
    },
  ]

  return (
    <section id="caracteristicas" className="py-16 md:py-24 px-6 md:px-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Características</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Diseñado para simplificar la gestión de recursos humanos y nómina
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
