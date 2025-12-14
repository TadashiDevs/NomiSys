"use client"

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications, Notification } from '@/context/NotificationContext'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications
  } = useNotifications()
  const [open, setOpen] = useState(false)

  // Manejar clic en el botón de notificaciones
  const handleBellClick = () => {
    setOpen(!open)
    if (!open && unreadCount > 0) {
      // Marcar todas como leídas cuando se abre el popover
      markAllAsRead()
    }
  }

  // Formatear la fecha relativa (ej: "hace 5 minutos")
  const formatRelativeTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: es })
  }

  // Obtener el color de fondo según el tipo de notificación
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-300'
      case 'warning':
        return 'bg-yellow-100 border-yellow-300'
      case 'error':
        return 'bg-red-100 border-red-300'
      default:
        return 'bg-blue-100 border-blue-300'
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" onClick={handleBellClick}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
          <span className="sr-only">Notificaciones</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notificaciones</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllNotifications}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Limpiar todo
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[300px]">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              No hay notificaciones
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 relative ${notification.read ? '' : 'bg-muted/50'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1" style={{ whiteSpace: 'pre-line' }}>{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatRelativeTime(notification.timestamp)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full"
                      onClick={() => clearNotification(notification.id)}
                    >
                      &times;
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
