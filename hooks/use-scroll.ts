"use client"

import { useState, useEffect } from "react"

interface UseScrollOptions {
  threshold?: number
}

export function useScroll({ threshold = 50 }: UseScrollOptions = {}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > threshold) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    
    // Llamar a handleScroll inmediatamente para establecer el estado inicial
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [threshold])

  return scrolled
}
