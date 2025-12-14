"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SmoothScrollLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  duration?: number; // duración de la animación en ms
}

export function SmoothScrollLink({
  href,
  children,
  className,
  duration = 800,
}: SmoothScrollLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Solo aplicar para enlaces internos que comienzan con #
    if (href.startsWith("#")) {
      e.preventDefault();
      
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const offsetTop = targetElement.getBoundingClientRect().top;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetPosition = offsetTop + scrollTop;
        
        // Animación de desplazamiento suave
        const startTime = performance.now();
        const startScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        function scrollAnimation(currentTime: number) {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          
          // Función de easing para hacer la animación más natural
          const easeInOutCubic = (t: number) => 
            t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          
          const easedProgress = easeInOutCubic(progress);
          
          window.scrollTo(0, startScrollTop + (targetPosition - startScrollTop) * easedProgress);
          
          if (progress < 1) {
            window.requestAnimationFrame(scrollAnimation);
          }
        }
        
        window.requestAnimationFrame(scrollAnimation);
      }
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(className)}
    >
      {children}
    </Link>
  );
}
