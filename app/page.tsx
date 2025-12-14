"use client"

import { useState, useEffect } from "react"
import AnimatedBackground from "@/components/common/AnimatedBackground"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import HeroSection from "@/components/home/HeroSection"
import FeaturesSection from "@/components/home/FeaturesSection"
import FunctionalitySection from "@/components/home/FunctionalitySection"
import DesignSection from "@/components/home/DesignSection"
import { useScroll } from "@/hooks/use-scroll"

export default function Home() {
  const [loaded, setLoaded] = useState(false)
  const scrolled = useScroll({ threshold: 50 })

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-gray-950">
      {/* Animated Background */}
      <AnimatedBackground loaded={loaded} />

      {/* Header */}
      <Header scrolled={scrolled} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-20 md:pt-24">
        {/* Hero Section */}
        <HeroSection />

        {/* Características del sistema */}
        <FeaturesSection />

        {/* Funcionalidades detalladas */}
        <FunctionalitySection />

        {/* Diseño intuitivo */}
        <DesignSection />

        {/* Footer */}
        <Footer />
      </main>
    </div>
  )
}