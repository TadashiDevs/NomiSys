"use client"

import { motion } from "framer-motion"

interface AnimatedBackgroundProps {
  loaded: boolean
}

export default function AnimatedBackground({ loaded }: AnimatedBackgroundProps) {
  if (!loaded) return null

  return (
    <div className="absolute inset-0 -z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          delay: 0.5,
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          delay: 1,
        }}
        className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-green-500"
      />
    </div>
  )
}
