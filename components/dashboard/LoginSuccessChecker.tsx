"use client"

import { useEffect } from 'react'
import { useToastNotifications } from '@/context/ToastNotificationContext'
import { useNotifications } from '@/context/NotificationContext'

export function LoginSuccessChecker() {
  const { showToast } = useToastNotifications()
  const { addNotification } = useNotifications()

  useEffect(() => {
    // Verificar si hay una notificación pendiente de mostrar
    const showNotification = localStorage.getItem('showContractNotification')
    const message = localStorage.getItem('contractNotificationMessage')
    const addToPanel = localStorage.getItem('addToNotificationPanel')

    // Imprimir en consola para debugging
    console.log('Estado de notificaciones al cargar LoginSuccessChecker:', {
      showNotification,
      messageLength: message ? message.length : 0,
      addToPanel
    })

    if (showNotification === 'true' && message) {
      // Mostrar la notificación temporal
      showToast(
        'Contratos próximos a vencer',
        message,
        'warning'
      )

      // Siempre agregar la notificación al panel de notificaciones
      // Esto garantiza que aparezca en el icono de campana
      console.log('Agregando notificación al panel:', message);

      try {
        addNotification(
          'Contratos próximos a vencer',
          message,
          'warning'
        );
        console.log('Notificación agregada correctamente');
      } catch (error) {
        console.error('Error al agregar notificación:', error);
      }

      // Limpiar el flag si existe
      if (addToPanel === 'true') {
        localStorage.removeItem('addToNotificationPanel')
      }

      // Reproducir sonido de notificación manualmente
      if (typeof window !== 'undefined' && window.playNotificationSound) {
        window.playNotificationSound();
      }

      // Limpiar los datos para no mostrar la notificación toast nuevamente
      // pero mantener la información para debugging
      localStorage.setItem('showContractNotification', 'false')
      // No eliminamos el mensaje para poder verificar que se está guardando correctamente

      // Actualizar la fecha de la última verificación
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      localStorage.setItem('lastContractCheckDate', today.toISOString())
    }
  }, [showToast, addNotification])

  // Este componente no renderiza nada visible
  return null
}
