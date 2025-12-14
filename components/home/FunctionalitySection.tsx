"use client"

import { motion } from "framer-motion"
import FunctionalityItem from "./FunctionalityItem"

export default function FunctionalitySection() {
  const functionalities = [
    {
      title: "Gestión automatizada de nómina",
      description:
        "Automatiza todo el proceso de cálculo de nómina, desde salarios base hasta bonificaciones, deducciones e impuestos. NomiSys se encarga de todos los cálculos complejos para que tú puedas enfocarte en lo importante.",
      features: [
        "Cálculo automático de impuestos y deducciones",
        "Gestión de bonificaciones y horas extras",
        "Procesamiento de pagos masivos",
      ],
      image: "/images/feature-1.svg",
      color: "blue",
      imagePosition: "right",
    },
    {
      title: "Portal de empleados",
      description:
        "Ofrece a tus empleados acceso a un portal personalizado donde pueden consultar sus recibos de nómina, solicitar vacaciones y actualizar su información personal, todo desde cualquier dispositivo.",
      features: [
        "Acceso a recibos de nómina digitales",
        "Gestión de solicitudes de vacaciones",
        "Actualización de datos personales",
      ],
      image: "/images/feature-2.svg",
      color: "green",
      imagePosition: "left",
    },
    {
      title: "Alertas y recordatorios inteligentes",
      description:
        "Nunca más olvides fechas importantes. NomiSys te notifica automáticamente sobre vencimientos de contratos, cumpleaños de empleados y fechas límite para declaraciones fiscales.",
      features: [
        "Notificaciones de vencimiento de contratos",
        "Recordatorios de fechas fiscales importantes",
        "Alertas personalizables según tus necesidades",
      ],
      image: "/images/feature-3.svg",
      color: "purple",
      imagePosition: "right",
    },
  ]

  return (
    <section id="funcionalidades" className="py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Funcionalidades detalladas</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Descubre cómo NomiSys puede transformar tu gestión de recursos humanos
          </p>
        </motion.div>

        <div className="space-y-24">
          {functionalities.map((functionality, index) => (
            <FunctionalityItem key={index} {...functionality} />
          ))}
        </div>
      </div>
    </section>
  )
}
