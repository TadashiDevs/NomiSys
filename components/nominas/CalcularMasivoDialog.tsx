"use client"

import { useState } from "react"
import { Users, Calendar, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { nominasApi, formatearMoneda, formatearPeriodo } from "@/services/api/nominas"

interface CalcularMasivoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function CalcularMasivoDialog({ open, onOpenChange, onSuccess }: CalcularMasivoDialogProps) {
  const [calculando, setCalculando] = useState(false)
  const [formData, setFormData] = useState({
    ano: new Date().getFullYear(),
    mes: new Date().getMonth() + 1
  })
  const [resultados, setResultados] = useState<any>(null)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calcularMasivo = async () => {
    setCalculando(true)
    setResultados(null)
    
    try {
      const result = await nominasApi.calcularMasivo({
        ano: formData.ano,
        mes: formData.mes
      })

      if (result.success) {
        setResultados(result)
        toast.success(`Proceso completado: ${result.summary?.exitosos} nóminas calculadas`)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Error en el cálculo masivo')
    } finally {
      setCalculando(false)
    }
  }

  const confirmarCalculo = () => {
    onSuccess()
    onOpenChange(false)
    setFormData({
      ano: new Date().getFullYear(),
      mes: new Date().getMonth() + 1
    })
    setResultados(null)
  }

  // Generar años y meses
  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
  const meses = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Calcular Nóminas Masivo
          </DialogTitle>
          <DialogDescription>
            Calcula las nóminas para todos los trabajadores activos en el período seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formulario */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ano">Año *</Label>
              <Select
                value={formData.ano.toString()}
                onValueChange={(value) => handleInputChange('ano', parseInt(value))}
                disabled={calculando}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anos.map(ano => (
                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mes">Mes *</Label>
              <Select 
                value={formData.mes.toString()} 
                onValueChange={(value) => handleInputChange('mes', parseInt(value))}
                disabled={calculando}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meses.map(mes => (
                    <SelectItem key={mes.value} value={mes.value.toString()}>{mes.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advertencia */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                Importante
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-yellow-700">
              <ul className="space-y-1">
                <li>• Se calcularán las nóminas para todos los trabajadores con contratos activos</li>
                <li>• Si ya existe una nómina para un trabajador en este período, se omitirá</li>
                <li>• El proceso puede tomar varios minutos dependiendo del número de trabajadores</li>
                <li>• Se aplicarán las fórmulas de ley vigentes para {formData.año}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Información del período */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Período Seleccionado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {formatearPeriodo(formData.ano, formData.mes)}
              </div>
              <p className="text-sm text-muted-foreground">
                Se calcularán las nóminas del 1 al {new Date(formData.ano, formData.mes, 0).getDate()} de {meses.find(m => m.value === formData.mes)?.label.toLowerCase()}
              </p>
            </CardContent>
          </Card>

          {/* Progreso del cálculo */}
          {calculando && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Calculando Nóminas...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={undefined} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    Procesando trabajadores activos...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resultados */}
          {resultados && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Resultados del Cálculo Masivo
                </CardTitle>
                <CardDescription>
                  {formatearPeriodo(formData.año, formData.mes)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Resumen */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-blue-600">
                      {resultados.summary?.total_procesados || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Procesados</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-green-600">
                      {resultados.summary?.exitosos || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Exitosos</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-red-600">
                      {resultados.summary?.errores || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Errores</div>
                  </div>
                </div>

                {/* Lista detallada */}
                <div className="space-y-2">
                  <h4 className="font-medium">Detalle por Trabajador</h4>
                  <ScrollArea className="h-48 border rounded-md p-2">
                    <div className="space-y-2">
                      {resultados.data?.map((resultado: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-sm">
                          <div className="flex items-center gap-2">
                            {resultado.status === 'success' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium">{resultado.nombre}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {resultado.status === 'success' ? (
                              <Badge variant="success">
                                {formatearMoneda(resultado.neto_pagar)}
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">
                                {resultado.error}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Total calculado */}
                {resultados.summary?.exitosos > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Neto Calculado:</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatearMoneda(
                          resultados.data
                            ?.filter((r: any) => r.status === 'success')
                            ?.reduce((sum: number, r: any) => sum + (r.neto_pagar || 0), 0) || 0
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          {!resultados ? (
            <Button 
              onClick={calcularMasivo} 
              disabled={calculando}
              className="gap-2"
            >
              {calculando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Calculando...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  Calcular Todas las Nóminas
                </>
              )}
            </Button>
          ) : (
            <Button onClick={confirmarCalculo} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Confirmar y Cerrar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
