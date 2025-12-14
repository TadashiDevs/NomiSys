"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { NotificationType } from '@/context/NotificationContext'
import { NotificationToastManager } from '@/components/dashboard/NotificationToast'

interface ToastNotification {
  id: string
  title: string
  message: string
  type: NotificationType
}

interface ToastNotificationContextType {
  showToast: (title: string, message: string, type?: NotificationType) => void
}

const ToastNotificationContext = createContext<ToastNotificationContextType | undefined>(undefined)

export const useToastNotifications = () => {
  const context = useContext(ToastNotificationContext)
  if (context === undefined) {
    throw new Error('useToastNotifications debe ser usado dentro de un ToastNotificationProvider')
  }
  return context
}

interface ToastNotificationProviderProps {
  children: ReactNode
}

export const ToastNotificationProvider = ({ children }: ToastNotificationProviderProps) => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([])

  // Mostrar una nueva notificación toast con sonido
  const showToast = (title: string, message: string, type: NotificationType = 'info') => {
    const id = Date.now().toString()

    const newNotification: ToastNotification = {
      id,
      title,
      message,
      type
    }

    setNotifications(prev => [...prev, newNotification])

    // Reproducir sonido de notificación usando la función global
    try {
      if (typeof window !== 'undefined' && window.playNotificationSound) {
        window.playNotificationSound();
      }
    } catch (error) {
      console.error('Error al reproducir sonido de notificación:', error);
    }

    // Eliminar automáticamente después de 5 segundos
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  // Eliminar una notificación toast
  const removeToast = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  return (
    <ToastNotificationContext.Provider value={{ showToast }}>
      {children}
      <NotificationToastManager
        notifications={notifications}
        onClose={removeToast}
      />
    </ToastNotificationContext.Provider>
  )
}
