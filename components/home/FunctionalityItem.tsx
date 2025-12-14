"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

interface FunctionalityItemProps {
  title: string
  description: string
  features: string[]
  image: string
  color: "blue" | "green" | "purple"
  imagePosition: "left" | "right"
}

export default function FunctionalityItem({
  title,
  description,
  features,
  image,
  color,
  imagePosition,
}: FunctionalityItemProps) {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
  }

  const gradientClasses = {
    blue: "from-blue-500/20 to-purple-500/20",
    green: "from-green-500/20 to-blue-500/20",
    purple: "from-purple-500/20 to-red-500/20",
  }

  const Content = () => (
    <motion.div
      initial={{ opacity: 0, x: imagePosition === "right" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: imagePosition === "right" ? 0 : 0.2 }}
      className={imagePosition === "left" ? "md:order-2 order-1" : ""}
    >
      <h3 className="text-2xl md:text-3xl font-bold mb-4">{title}</h3>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{description}</p>
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <ArrowRight className={`h-5 w-5 ${colorClasses[color]} mr-2 flex-shrink-0 mt-0.5`} />
            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )

  const ImageComponent = () => (
    <motion.div
      initial={{ opacity: 0, x: imagePosition === "right" ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: imagePosition === "right" ? 0.2 : 0 }}
      className={`relative h-[300px] w-full rounded-xl overflow-hidden shadow-xl ${
        imagePosition === "left" ? "md:order-1 order-2" : ""
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[color]} z-10 rounded-xl`}></div>
      <Image src={image} alt={title} fill className="object-cover" />
    </motion.div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      {imagePosition === "right" ? (
        <>
          <Content />
          <ImageComponent />
        </>
      ) : (
        <>
          <ImageComponent />
          <Content />
        </>
      )}
    </div>
  )
}
