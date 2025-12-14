"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, User, FileText } from "lucide-react"
import { type Nomina, formatearMoneda } from "@/services/api/nominas"
import { contratosApi } from "@/services/api/contratos"
import { useEffect, useState } from "react"

interface DetalleNominaDialogProps {
  nomina: Nomina | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DetalleNominaDialog({
  nomina,
  open,
  onOpenChange
}: DetalleNominaDialogProps) {
  const [contratoInfo, setContratoInfo] = useState<{
    cargo: string
    departamento: string
    pension: string
  } | null>(null)

  // Cargar información del contrato cuando se abre el modal
  useEffect(() => {
    if (nomina && open) {
      const cargarContrato = async () => {
        try {
          const contratos = await contratosApi.getByWorkerId(nomina.trabajador_id)
          const contratoActivo = contratos.find(c => c.estado === 'Activo' || c.status === 'Activo')

          if (contratoActivo) {
            setContratoInfo({
              cargo: contratoActivo.cargo || contratoActivo.position || 'No especificado',
              departamento: contratoActivo.departamento || contratoActivo.department || 'No especificado',
              pension: contratoActivo.pension || contratoActivo.pensionSystem || 'AFP'
            })
          }
        } catch (error) {
          console.warn('No se pudo cargar información del contrato:', error)
          setContratoInfo({
            cargo: 'No especificado',
            departamento: 'No especificado',
            pension: 'AFP'
          })
        }
      }

      cargarContrato()
    }
  }, [nomina, open])

  if (!nomina) return null

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-4 w-4" />
            Detalle de Nómina - {nomina.trabajador_nombre}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del trabajador */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Información del Trabajador
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Nombre Completo</p>
                  <p className="font-medium">{nomina.trabajador_nombre}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cédula/DNI</p>
                  <p className="font-medium">{nomina.trabajador_cedula}</p>
                </div>
                {contratoInfo && (
                  <>
                    <div>
                      <p className="text-muted-foreground">Cargo</p>
                      <p className="font-medium">{contratoInfo.cargo}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Departamento</p>
                      <p className="font-medium">{contratoInfo.departamento}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sistema de Pensión</p>
                      <p className="font-medium">{contratoInfo.pension}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Estado de Nómina</span>
                <Badge
                  variant={nomina.estado === "Calculada" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {nomina.estado}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Información del período */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Período de Nómina
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Período</p>
                  <p className="font-medium">{nomina.periodo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fecha de Cálculo</p>
                  <p className="font-medium text-xs">{formatearFecha(nomina.fecha_calculo)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Devengados (Ingresos) */}
          <div className="space-y-3">
            <h3 className="text-green-600 font-medium text-sm">Ingresos</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Salario Base:</span>
                <span className="font-mono">{formatearMoneda(nomina.salario_base)}</span>
              </div>

              <div className="flex justify-between">
                <span>Asignación Familiar:</span>
                <span className="font-mono">{formatearMoneda(nomina.auxilio_transporte || 0)}</span>
              </div>

              <div className="flex justify-between">
                <span>Horas Extras:</span>
                <span className="font-mono">{formatearMoneda((nomina.valor_horas_extras_diurnas || 0) + (nomina.valor_horas_extras_nocturnas || 0))}</span>
              </div>

              <div className="flex justify-between">
                <span>Bonificaciones:</span>
                <span className="font-mono">{formatearMoneda(nomina.bonificaciones || 0)}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-green-600 pt-2 border-t">
              <span>Total Ingresos:</span>
              <span className="font-mono">{formatearMoneda(nomina.total_devengados)}</span>
            </div>
          </div>

          {/* Deducciones */}
          <div className="space-y-3">
            <h3 className="text-red-600 font-medium text-sm">Deducciones</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Sistema Pensión:</span>
                <span className="font-mono">{formatearMoneda(nomina.descuento_pension || 0)}</span>
              </div>

              <div className="flex justify-between">
                <span>Retención 5ta Cat.:</span>
                <span className="font-mono">{formatearMoneda(nomina.retencion_fuente || 0)}</span>
              </div>

              <div className="flex justify-between">
                <span>Otras Deducciones:</span>
                <span className="font-mono">{formatearMoneda(nomina.otras_deducciones || 0)}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-red-600 pt-2 border-t">
              <span>Total Deducciones:</span>
              <span className="font-mono">{formatearMoneda(nomina.total_deducciones)}</span>
            </div>
          </div>

          {/* Neto a Pagar */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-blue-800">Neto a Pagar</span>
              <span className="text-xl font-bold font-mono text-blue-800">
                {formatearMoneda(nomina.neto_pagar)}
              </span>
            </div>
          </div>

          {/* Observaciones */}
          {nomina.observaciones && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Observaciones</h4>
              <p className="text-sm text-muted-foreground">{nomina.observaciones}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
