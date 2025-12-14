"use client"

import { useEffect } from 'react'
import { useNotifications } from '@/context/NotificationContext'
import { useToastNotifications } from '@/context/ToastNotificationContext'
import { contratosApi } from '@/services/api/contratos'

export function ContractExpirationChecker() {
  const { addNotification } = useNotifications()
  const { showToast } = useToastNotifications()

  useEffect(() => {
    const checkExpiringContracts = async () => {
      try {
        // Verificar si ya se realizó la comprobación hoy
        const lastCheckDate = localStorage.getItem('lastContractCheckDate')
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (lastCheckDate && new Date(lastCheckDate).getTime() === today.getTime()) {
          console.log('Ya se verificaron los contratos hoy')
          return
        }

        // Obtener todos los contratos
        const contracts = await contratosApi.getAll()

        // Filtrar contratos que vencen en los próximos 30 días
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(today.getDate() + 30)

        const expiringContracts = contracts.filter(contract => {
          // Solo contratos a plazo fijo y activos
          if ((contract.type !== 'Plazo Fijo' && contract.tipo !== 'Plazo Fijo') ||
              (contract.status !== 'Activo' && contract.estado !== 'Activo')) {
            return false
          }

          // Obtener la fecha de fin del contrato
          const endDateStr = contract.endDate || contract.fecha_fin
          if (!endDateStr) return false

          // Convertir la fecha de fin a objeto Date
          let endDate: Date

          // Si la fecha tiene formato dd/mm/yyyy
          if (endDateStr.includes('/')) {
            const [day, month, year] = endDateStr.split('/').map(Number)
            endDate = new Date(year, month - 1, day)
          }
          // Si la fecha tiene formato ISO
          else if (endDateStr.includes('-')) {
            endDate = new Date(endDateStr)
          }
          // Si no se puede parsear la fecha
          else {
            return false
          }

          // Verificar si el contrato vence en los próximos 30 días
          return endDate >= today && endDate <= thirtyDaysFromNow
        })

        // Notificar sobre contratos próximos a vencer
        if (expiringContracts.length > 0) {
          // Crear mensaje detallado con días exactos para cada contrato
          const expiringDetails = expiringContracts.map(contract => {
            const worker = contract.worker ||
                          (contract.trabajador ? contract.trabajador.nombres_completos : 'Trabajador sin nombre')

            const endDateStr = contract.endDate || contract.fecha_fin

            // Calcular días restantes
            let endDate: Date
            if (endDateStr.includes('/')) {
              const [day, month, year] = endDateStr.split('/').map(Number)
              endDate = new Date(year, month - 1, day)
            } else if (endDateStr.includes('-')) {
              endDate = new Date(endDateStr)
            } else {
              return `${worker} - Fecha de vencimiento inválida`
            }

            const diasRestantes = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            return `${worker} - Vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`
          }).join('\n')

          // Crear una única notificación agrupada con información de días exactos
          if (expiringContracts.length === 1) {
            // Si solo hay un contrato por vencer
            const contract = expiringContracts[0];
            const worker = contract.worker ||
                          (contract.trabajador ? contract.trabajador.nombres_completos : 'Trabajador sin nombre');

            const endDateStr = contract.endDate || contract.fecha_fin;

            // Calcular días restantes
            let endDate: Date;
            if (endDateStr.includes('/')) {
              const [day, month, year] = endDateStr.split('/').map(Number);
              endDate = new Date(year, month - 1, day);
            } else if (endDateStr.includes('-')) {
              endDate = new Date(endDateStr);
            } else {
              return;
            }

            const diasRestantes = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            // Agregar una única notificación
            addNotification(
              'Contrato por vencer',
              `El contrato de ${worker} vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}.`,
              diasRestantes <= 7 ? 'error' : 'warning'
            );

            // Ya no mostramos notificación temporal aquí, ya que ahora se muestra al iniciar sesión
          } else {
            // Si hay múltiples contratos por vencer
            // Agrupar contratos por días restantes
            const contractsByDays: Record<number, string[]> = {};

            expiringContracts.forEach(contract => {
              const worker = contract.worker ||
                            (contract.trabajador ? contract.trabajador.nombres_completos : 'Trabajador sin nombre');

              const endDateStr = contract.endDate || contract.fecha_fin;

              // Calcular días restantes
              let endDate: Date;
              if (endDateStr.includes('/')) {
                const [day, month, year] = endDateStr.split('/').map(Number);
                endDate = new Date(year, month - 1, day);
              } else if (endDateStr.includes('-')) {
                endDate = new Date(endDateStr);
              } else {
                return;
              }

              const diasRestantes = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

              if (!contractsByDays[diasRestantes]) {
                contractsByDays[diasRestantes] = [];
              }

              contractsByDays[diasRestantes].push(worker);
            });

            // Crear mensaje detallado
            const message = Object.entries(contractsByDays)
              .sort(([daysA], [daysB]) => Number(daysA) - Number(daysB))
              .map(([days, workers]) => {
                const daysNum = Number(days);
                return `${workers.length} contrato${workers.length > 1 ? 's' : ''} vence${workers.length > 1 ? 'n' : ''} en ${daysNum} día${daysNum !== 1 ? 's' : ''}.`;
              })
              .join('\n');

            // Agregar una única notificación agrupada
            addNotification(
              'Contratos próximos a vencer',
              message,
              'warning'
            );

            // Ya no mostramos notificación temporal aquí, ya que ahora se muestra al iniciar sesión
          }

          // Guardar detalles en localStorage para consulta posterior
          localStorage.setItem('expiringContractsDetails', expiringDetails)
        }

        // Actualizar la fecha de la última verificación
        localStorage.setItem('lastContractCheckDate', today.toISOString())
      } catch (error) {
        console.error('Error al verificar contratos próximos a vencer:', error)
      }
    }

    // Verificar al cargar el componente
    checkExpiringContracts()

    // No es necesario configurar un intervalo aquí, ya que el componente
    // se monta cada vez que el usuario accede al dashboard
  }, [addNotification])

  // Este componente no renderiza nada visible
  return null
}
