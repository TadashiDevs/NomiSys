/**
 * API para gestión de nóminas
 * 
 * Este archivo contiene todas las funciones para interactuar con la API de nóminas,
 * incluyendo cálculo individual, masivo, consultas y gestión de estados.
 */

import http from '../utils/http';

// Tipos
export interface Nomina {
  id: number;
  trabajador_id: number;
  trabajador_nombre: string;
  trabajador_cedula: string;
  periodo: string;
  ano: number;
  mes: number;
  salario_base: number;
  auxilio_transporte: number;
  horas_extras_diurnas: number;
  horas_extras_nocturnas: number;
  valor_horas_extras_diurnas: number;
  valor_horas_extras_nocturnas: number;
  bonificaciones: number;
  total_devengados: number;
  descuento_salud: number;
  descuento_pension: number;
  retencion_fuente: number;
  otras_deducciones: number;
  total_deducciones: number;
  neto_pagar: number;
  estado: 'Calculada' | 'Verificada' | 'Pagada' | 'Anulada';
  fecha_calculo: string;
  fecha_pago?: string;
  observaciones?: string;
}

export interface NominaDetalle {
  id: number;
  trabajador: {
    id: number;
    nombre: string;
    cedula: string;
  };
  contrato: {
    id: number;
    cargo: string;
    departamento: string;
  };
  periodo: {
    ano: number;
    mes: number;
    nombre_mes: string;
    fecha_inicio: string;
    fecha_fin: string;
  };
  devengados: {
    salario_base: number;
    auxilio_transporte: number;
    horas_extras_diurnas: number;
    valor_horas_extras_diurnas: number;
    horas_extras_nocturnas: number;
    valor_horas_extras_nocturnas: number;
    bonificaciones: number;
    total: number;
  };
  deducciones: {
    descuento_salud: number;
    descuento_pension: number;
    retencion_fuente: number;
    otras_deducciones: number;
    total: number;
  };
  neto_pagar: number;
  estado: string;
  fecha_calculo: string;
  fecha_pago?: string;
  observaciones?: string;
}

export interface CalcularNominaRequest {
  trabajador_id: number;
  ano: number;
  mes: number;
  horas_extras_diurnas?: number;
  horas_extras_nocturnas?: number;
}

export interface CalcularMasivoRequest {
  ano: number;
  mes: number;
}

export interface ResultadoCalculoMasivo {
  trabajador_id: number;
  nombre: string;
  status: 'success' | 'error';
  nomina_id?: number;
  neto_pagar?: number;
  error?: string;
}

export interface FiltrosNomina {
  ano?: number;
  mes?: number;
  estado?: string;
  trabajador_id?: number;
}

// API de nóminas
export const nominasApi = {
  /**
   * Obtener todas las nóminas con filtros opcionales
   */
  obtenerTodas: async (filtros?: FiltrosNomina): Promise<Nomina[]> => {
    try {
      const params: Record<string, string> = {};

      if (filtros?.ano) params.ano = filtros.ano.toString();
      if (filtros?.mes) params.mes = filtros.mes.toString();
      if (filtros?.estado && filtros.estado !== 'todos') params.estado = filtros.estado;
      if (filtros?.trabajador_id) params.trabajador_id = filtros.trabajador_id.toString();

      const response = await http.get<{ success: boolean; data: Nomina[] }>('/api/nominas', { params });
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error('Error al obtener las nóminas');
    } catch (error) {
      console.error('Error en nominasApi.obtenerTodas:', error);
      return [];
    }
  },

  /**
   * Obtener detalle de una nómina específica
   */
  obtenerDetalle: async (id: number): Promise<NominaDetalle | null> => {
    try {
      const response = await http.get<{ success: boolean; data: NominaDetalle }>(`/api/nominas/${id}`);
      
      if (response.success) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error en nominasApi.obtenerDetalle:', error);
      return null;
    }
  },

  /**
   * Calcular nómina individual
   */
  calcular: async (datos: CalcularNominaRequest): Promise<{ success: boolean; data?: any; message: string }> => {
    try {
      const response = await http.post<{ success: boolean; data?: any; message: string }>('/api/nominas/calcular', datos);
      return response;
    } catch (error: any) {
      console.error('Error en nominasApi.calcular:', error);
      return {
        success: false,
        message: error.message || 'Error al calcular la nómina'
      };
    }
  },

  /**
   * Calcular nóminas masivas
   */
  calcularMasivo: async (datos: CalcularMasivoRequest): Promise<{ 
    success: boolean; 
    data?: ResultadoCalculoMasivo[]; 
    summary?: {
      total_procesados: number;
      exitosos: number;
      errores: number;
    };
    message: string 
  }> => {
    try {
      const response = await http.post<{ 
        success: boolean; 
        data: ResultadoCalculoMasivo[];
        summary: {
          total_procesados: number;
          exitosos: number;
          errores: number;
        };
        message: string 
      }>('/api/nominas/calcular-masivo', datos);
      
      return response;
    } catch (error: any) {
      console.error('Error en nominasApi.calcularMasivo:', error);
      return {
        success: false,
        message: error.message || 'Error en el cálculo masivo'
      };
    }
  },

  /**
   * Marcar nómina como verificada
   */
  marcarVerificada: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await http.post<{ success: boolean; message: string }>(`/api/nominas/${id}/marcar-verificada`);
      return response;
    } catch (error: any) {
      console.error('Error en nominasApi.marcarVerificada:', error);
      return {
        success: false,
        message: error.message || 'Error al verificar la nómina'
      };
    }
  },

  /**
   * Marcar nómina como pagada
   */
  marcarPagada: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await http.post<{ success: boolean; message: string }>(`/api/nominas/${id}/marcar-pagada`);
      return response;
    } catch (error: any) {
      console.error('Error en nominasApi.marcarPagada:', error);
      return {
        success: false,
        message: error.message || 'Error al marcar la nómina como pagada'
      };
    }
  },

  /**
   * Generar boleta de pago en PDF
   */
  generarBoletaPDF: async (id: number): Promise<{ success: boolean; data?: any; message: string }> => {
    try {
      const response = await http.get<{ success: boolean; data?: any; message: string }>(`/api/nominas/${id}/boleta-pdf`);
      return response;
    } catch (error: any) {
      console.error('Error en nominasApi.generarBoletaPDF:', error);
      return {
        success: false,
        message: error.message || 'Error al generar la boleta de pago'
      };
    }
  },

  /**
   * Obtener nóminas por trabajador
   */
  obtenerPorTrabajador: async (trabajadorId: number): Promise<Nomina[]> => {
    return nominasApi.obtenerTodas({ trabajador_id: trabajadorId });
  },

  /**
   * Obtener nóminas por período
   */
  obtenerPorPeriodo: async (año: number, mes: number): Promise<Nomina[]> => {
    return nominasApi.obtenerTodas({ año, mes });
  },

  /**
   * Obtener estadísticas de nóminas
   */
  obtenerEstadisticas: async (ano: number, mes: number): Promise<{
    total_nominas: number;
    total_devengados: number;
    total_deducciones: number;
    total_neto: number;
    nominas_pagadas: number;
    nominas_pendientes: number;
  }> => {
    try {
      const nominas = await nominasApi.obtenerPorPeriodo(ano, mes);
      
      const estadisticas = {
        total_nominas: nominas.length,
        total_devengados: nominas.reduce((sum, n) => sum + n.total_devengados, 0),
        total_deducciones: nominas.reduce((sum, n) => sum + n.total_deducciones, 0),
        total_neto: nominas.reduce((sum, n) => sum + n.neto_pagar, 0),
        nominas_pagadas: nominas.filter(n => n.estado === 'Pagada').length,
        nominas_pendientes: nominas.filter(n => n.estado === 'Calculada').length,
      };
      
      return estadisticas;
    } catch (error) {
      console.error('Error en nominasApi.obtenerEstadisticas:', error);
      return {
        total_nominas: 0,
        total_devengados: 0,
        total_deducciones: 0,
        total_neto: 0,
        nominas_pagadas: 0,
        nominas_pendientes: 0,
      };
    }
  }
};

// Utilidades para formateo
export const formatearMoneda = (valor: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
};

export const obtenerNombreMes = (mes: number): string => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[mes - 1] || '';
};

export const formatearPeriodo = (ano: number, mes: number): string => {
  return `${obtenerNombreMes(mes)} ${ano}`;
};
