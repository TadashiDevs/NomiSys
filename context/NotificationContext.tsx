"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { contratosApi } from '@/services/api'

// Definir tipos para las notificaciones
export type NotificationType = 'info' | 'warning' | 'success' | 'error'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  timestamp: Date
  read: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (title: string, message: string, type?: NotificationType) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications debe ser usado dentro de un NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [lastCheckDate, setLastCheckDate] = useState<Date | null>(null)

  // Calcular el número de notificaciones no leídas
  const unreadCount = notifications.filter(notification => !notification.read).length

  // Agregar una nueva notificación
  const addNotification = (title: string, message: string, type: NotificationType = 'info') => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev])
  }

  // Marcar una notificación como leída
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  // Eliminar una notificación
  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  // Eliminar todas las notificaciones
  const clearAllNotifications = () => {
    setNotifications([])
  }

  // Eliminamos la verificación de contratos próximos a vencer de este contexto
  // ya que ahora se maneja completamente en el componente ContractExpirationChecker
  useEffect(() => {
    // Cargar la fecha de la última verificación desde localStorage
    const savedLastCheckDate = localStorage.getItem('lastContractCheckDate')
    if (savedLastCheckDate) {
      try {
        setLastCheckDate(new Date(savedLastCheckDate))
      } catch (error) {
        console.error('Error al cargar la fecha de última verificación:', error)
      }
    }
  }, [])

  // Cargar notificaciones del localStorage al iniciar
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications')
    if (savedNotifications) {
      try {
        const parsedNotifications = JSON.parse(savedNotifications)
        // Convertir las cadenas de fecha a objetos Date
        const formattedNotifications = parsedNotifications.map((notification: any) => ({
          ...notification,
          timestamp: new Date(notification.timestamp)
        }))
        setNotifications(formattedNotifications)
      } catch (error) {
        console.error('Error al cargar notificaciones:', error)
      }
    }
  }, [])

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [notifications])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
