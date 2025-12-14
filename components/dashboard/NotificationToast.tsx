"use client"

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'
import { NotificationType } from '@/context/NotificationContext'

interface NotificationToastProps {
  title: string
  message: string
  type?: NotificationType
  duration?: number
  onClose?: () => void
}

export function NotificationToast({
  title,
  message,
  type = 'info',
  duration = 5000,
  onClose
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onClose) {
        setTimeout(onClose, 300) // Dar tiempo para la animación de salida
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  // Determinar el icono según el tipo de notificación
  const getNotificationIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const icon = getNotificationIcon()

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`fixed right-4 top-16 z-50 w-80 rounded-md border border-l-4 ${
            type === 'success' ? 'border-l-green-500' :
            type === 'warning' ? 'border-l-amber-500' :
            type === 'error' ? 'border-l-red-500' :
            'border-l-blue-500'
          } bg-white p-4 shadow-md`}
          style={{
            top: 'calc(4rem + 8px)', // Posicionar debajo del icono de notificaciones
            right: 'calc(2rem + 24px)' // Alinear con el icono de notificación
          }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">{icon}</div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium">{title}</h3>
              <div className="mt-1 text-sm text-gray-600">{message}</div>
            </div>
            {/* Eliminamos el botón de cerrar ya que las notificaciones desaparecerán automáticamente */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Componente para gestionar múltiples notificaciones
interface NotificationToastManagerProps {
  notifications: Array<{
    id: string
    title: string
    message: string
    type: NotificationType
  }>
  onClose: (id: string) => void
}

export function NotificationToastManager({
  notifications,
  onClose
}: NotificationToastManagerProps) {
  return (
    <>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            position: 'fixed',
            top: `calc(4rem + 8px + ${index * 110}px)`, // Posicionar debajo del icono de notificaciones
            right: 'calc(2rem + 24px)', // Alinear con el icono de notificación
            zIndex: 100 - index
          }}
        >
          <NotificationToast
            title={notification.title}
            message={notification.message}
            type={notification.type}
            onClose={() => onClose(notification.id)}
          />
        </div>
      ))}
    </>
  )
}
