"use client"

import React from "react"
import { ToastNotificationProvider } from "@/context/ToastNotificationContext"

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastNotificationProvider>
      {children}
    </ToastNotificationProvider>
  )
}
