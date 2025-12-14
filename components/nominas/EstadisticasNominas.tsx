"use client"

import { useState, useEffect } from "react"
import { TrendingUp, DollarSign, Users, Calendar, PieChart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { nominasApi, formatearMoneda, formatearPeriodo } from "@/services/api/nominas"

interface EstadisticasNominasProps {
  ano: number
  mes: number
}

export default function EstadisticasNominas({ ano, mes }: EstadisticasNominasProps) {
  const [estadisticas, setEstadisticas] = useState({
    total_nominas: 0,
    total_devengados: 0,
    total_deducciones: 0,
    total_neto: 0,
    nominas_pagadas: 0,
    nominas_pendientes: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
  }, [ano, mes])

  const cargarEstadisticas = async () => {
    setLoading(true)
    try {
      const data = await nominasApi.obtenerEstadisticas(ano, mes)
      setEstadisticas(data)
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular porcentajes
  const porcentajePagadas = estadisticas.total_nominas > 0 
    ? (estadisticas.nominas_pagadas / estadisticas.total_nominas) * 100 
    : 0

  const porcentajeDeducciones = estadisticas.total_devengados > 0 
    ? (estadisticas.total_deducciones / estadisticas.total_devengados) * 100 
    : 0

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <PieChart className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Estadísticas de Nóminas</h2>
        <span className="text-muted-foreground">- {formatearPeriodo(ano, mes)}</span>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total de nóminas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Nóminas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total_nominas}</div>
            <p className="text-xs text-muted-foreground">
              Trabajadores procesados
            </p>
          </CardContent>
        </Card>

        {/* Total ingresos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatearMoneda(estadisticas.total_devengados)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos brutos del período
            </p>
          </CardContent>
        </Card>

        {/* Total deducciones */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deducciones</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatearMoneda(estadisticas.total_deducciones)}
            </div>
            <p className="text-xs text-muted-foreground">
              {porcentajeDeducciones.toFixed(1)}% de los ingresos
            </p>
          </CardContent>
        </Card>

        {/* Total neto */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Neto a Pagar</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatearMoneda(estadisticas.total_neto)}
            </div>
            <p className="text-xs text-muted-foreground">
              Monto final a desembolsar
            </p>
          </CardContent>
        </Card>

        {/* Nóminas pagadas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nóminas Pagadas</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {estadisticas.nominas_pagadas}
            </div>
            <div className="mt-2">
              <Progress value={porcentajePagadas} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {porcentajePagadas.toFixed(1)}% completadas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Nóminas pendientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nóminas Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {estadisticas.nominas_pendientes}
            </div>
            <p className="text-xs text-muted-foreground">
              Por procesar pago
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Desglose detallado */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Composición de ingresos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Composición de Ingresos</CardTitle>
            <CardDescription>
              Distribución de los conceptos que componen los ingresos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Salarios Base</span>
                <span className="font-mono">~83%</span>
              </div>
              <Progress value={83} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Asignación Familiar</span>
                <span className="font-mono">~10%</span>
              </div>
              <Progress value={10} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Horas Extras</span>
                <span className="font-mono">~3%</span>
              </div>
              <Progress value={3} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Bonificaciones</span>
                <span className="font-mono">~4%</span>
              </div>
              <Progress value={4} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Composición de deducciones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Composición de Deducciones</CardTitle>
            <CardDescription>
              Distribución de los descuentos aplicados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pensión (10-13%)</span>
                <span className="font-mono">~85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Retención 5ta Cat.</span>
                <span className="font-mono">Variable</span>
              </div>
              <Progress value={15} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Otras Deducciones</span>
                <span className="font-mono">~0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen ejecutivo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen Ejecutivo</CardTitle>
          <CardDescription>
            Análisis del período {formatearPeriodo(ano, mes)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">
                {estadisticas.total_nominas > 0 
                  ? formatearMoneda(Math.round(estadisticas.total_neto / estadisticas.total_nominas))
                  : formatearMoneda(0)
                }
              </div>
              <p className="text-sm text-muted-foreground">Promedio Neto por Trabajador</p>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">
                {porcentajeDeducciones.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Porcentaje de Deducciones</p>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold text-orange-600">
                {porcentajePagadas.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Progreso de Pagos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
