"use client"

import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  href?: string
  size?: "small" | "medium" | "large"
  className?: string
}

export default function Logo({ href, size = "medium", className = "" }: LogoProps) {
  const sizes = {
    small: { width: 40, height: 40, textSize: "text-lg" },
    medium: { width: 56, height: 56, textSize: "text-xl" },
    large: { width: 72, height: 72, textSize: "text-2xl" },
  }

  const { width, height, textSize } = sizes[size]

  // Componente de contenido del logo sin enlaces
  const LogoContent = () => (
    <div className={`flex items-center gap-0.5 ${className}`}>
      <Image src="/logo.png" alt="NomiSys Logo" width={width} height={height} className="rounded-lg" />
      <span className={`${textSize} font-bold`}>NomiSys</span>
    </div>
  )

  // Solo envolvemos en Link si se proporciona un href
  if (href) {
    return (
      <Link href={href} legacyBehavior={false}>
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
}
