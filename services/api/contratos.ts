/**
 * API de Contratos
 *
 * Este archivo contiene todas las funciones para interactuar con la API
 * relacionada con los contratos (CRUD y operaciones específicas).
 */

import http from '../utils/http';
import { FormData as ContratoFormData } from '@/components/contratos/types';

// Tipos
export interface Contrato {
  id: string;
  workerId?: number;
  trabajador_id?: number;  // Campo del backend
  type?: 'Indefinido' | 'Plazo Fijo';
  tipo?: 'Indefinido' | 'Plazo Fijo';  // Campo del backend
  startDate?: string;
  fecha_inicio?: string;  // Campo del backend
  endDate?: string;
  fecha_fin?: string;  // Campo del backend
  position?: string;
  cargo?: string;  // Campo del backend
  department?: string;
  departamento?: string;  // Campo del backend
  shift?: 'Mañana' | 'Tarde' | 'Noche';
  turno?: 'Mañana' | 'Tarde' | 'Noche';  // Campo del backend
  workday?: 'Jornada Completa' | 'Media Jornada';
  jornada?: 'Jornada Completa' | 'Media Jornada';  // Campo del backend
  pensionSystem?: 'AFP' | 'ONP';
  pension?: 'AFP' | 'ONP';  // Campo del backend
  salary?: string | number;
  salario?: string | number;  // Campo del backend
  status?: 'Activo' | 'Finalizado';
  estado?: 'Activo' | 'Finalizado';  // Campo del backend

  createdAt?: string;
  created_at?: string;  // Campo del backend
  updatedAt?: string;
  updated_at?: string;  // Campo del backend
}

// Endpoints
const BASE_PATH = '/api/contratos';

// Los datos ahora vienen del backend

// API de Contratos
export const contratosApi = {
  /**
   * Obtener todos los contratos
   * @param params Parámetros de filtrado (opcional)
   */
  getAll: async (params?: { status?: string; type?: string }): Promise<Contrato[]> => {
    try {
      // Llamada real a la API
      const response = await http.get<Contrato[]>(BASE_PATH, { params });

      // Procesar los contratos para asegurar compatibilidad
      const contratosCompatibles = response.map(contrato => {
        // Asegurarse de que el ID del trabajador esté disponible en ambos formatos
        if (contrato.trabajador_id && !contrato.workerId) {
          contrato.workerId = contrato.trabajador_id;
        } else if (contrato.workerId && !contrato.trabajador_id) {
          contrato.trabajador_id = contrato.workerId;
        }

        // Asegurarse de que los IDs estén disponibles para comparaciones
        if (contrato.workerId && typeof contrato.workerId !== 'number') {
          contrato.workerId = Number(contrato.workerId);
        }

        if (contrato.trabajador_id && typeof contrato.trabajador_id !== 'number') {
          contrato.trabajador_id = Number(contrato.trabajador_id);
        }

        // Log eliminado para mejorar el rendimiento

        return contrato;
      });

      return contratosCompatibles;
    } catch (error) {
      console.error('Error al obtener contratos:', error);
      throw error;
    }
  },

  /**
   * Obtener contratos por ID de trabajador
   * @param workerId ID del trabajador
   */
  getByWorkerId: async (workerId: number): Promise<Contrato[]> => {
    try {
      // Llamada real a la API
      return await http.get<Contrato[]>(`${BASE_PATH}/trabajador/${workerId}`);
    } catch (error) {
      console.error(`Error al obtener contratos del trabajador con ID ${workerId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener un contrato por ID
   * @param id ID del contrato
   */
  getById: async (id: string): Promise<Contrato | null> => {
    try {
      // Llamada real a la API
      return await http.get<Contrato>(`${BASE_PATH}/${id}`);
    } catch (error) {
      console.error(`Error al obtener contrato con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo contrato
   * @param data Datos del contrato
   */
  create: async (data: ContratoFormData): Promise<Contrato> => {
    try {
      // Preparar datos para el backend
      const contratoData: any = {
        trabajador_id: data.workerId || 0,
        tipo: data.type,
        estado: data.status || 'Activo',
      };

      // Procesar fecha de inicio
      if (data.startDate) {
        if (typeof data.startDate === 'object' && data.startDate.toISOString) {
          contratoData.fecha_inicio = data.startDate.toISOString().split('T')[0];
        } else {
          contratoData.fecha_inicio = data.startDate;
        }
      } else {
        contratoData.fecha_inicio = new Date().toISOString().split('T')[0];
      }

      // Procesar fecha de fin
      if (data.type === 'Plazo Fijo' && data.endDate) {
        if (typeof data.endDate === 'object' && data.endDate.toISOString) {
          contratoData.fecha_fin = data.endDate.toISOString().split('T')[0];
        } else {
          contratoData.fecha_fin = data.endDate;
        }
      } else {
        contratoData.fecha_fin = null;
      }

      // Procesar cargo
      contratoData.cargo = data.position || '';

      // Procesar departamento
      contratoData.departamento = data.department || '';

      // Procesar turno
      contratoData.turno = data.shift || 'Mañana';

      // Procesar jornada
      contratoData.jornada = data.workday || 'Jornada Completa';

      // Procesar sistema de pensión
      contratoData.pension = data.pension || 'AFP';

      // Procesar salario - asegurarse de que sea un número entero
      if (data.salary) {
        if (typeof data.salary === 'string') {
          // Eliminar cualquier carácter que no sea número
          const cleanedSalary = data.salary.replace(/\D/g, '');
          contratoData.salario = cleanedSalary ? parseInt(cleanedSalary) : 1025;
        } else {
          contratoData.salario = data.salary || 1025;
        }
      } else {
        contratoData.salario = 1025; // Salario mínimo por defecto
      }

      console.log('Datos a enviar al backend para crear contrato:', contratoData);

      // Llamada real a la API - una sola vez
      const result = await http.post<Contrato>(BASE_PATH, contratoData);
      return result;
    } catch (error) {
      console.error('Error al crear contrato:', error);
      throw error;
    }
  },

  /**
   * Actualizar un contrato existente
   * @param id ID del contrato
   * @param data Datos a actualizar
   */
  update: async (id: string, data: any): Promise<Contrato> => {
    try {
      // Preparar datos para el backend
      const updateData: any = {};

      // Procesar campos en inglés y español para mayor compatibilidad
      // Tipo de contrato
      if (data.type) updateData.tipo = data.type;
      if (data.tipo) updateData.tipo = data.tipo;

      // Fecha de inicio
      if (data.startDate) {
        if (typeof data.startDate === 'object' && data.startDate.toISOString) {
          updateData.fecha_inicio = data.startDate.toISOString().split('T')[0];
        } else {
          updateData.fecha_inicio = data.startDate;
        }
      }
      if (data.fecha_inicio) updateData.fecha_inicio = data.fecha_inicio;

      // Fecha de fin
      if (data.endDate) {
        if (typeof data.endDate === 'object' && data.endDate.toISOString) {
          updateData.fecha_fin = data.endDate.toISOString().split('T')[0];
        } else {
          updateData.fecha_fin = data.endDate;
        }
      } else if (data.type === 'Indefinido' || data.tipo === 'Indefinido') {
        updateData.fecha_fin = null;
      }
      if (data.fecha_fin) updateData.fecha_fin = data.fecha_fin;

      // Cargo/posición
      if (data.position) updateData.cargo = data.position;
      if (data.cargo) updateData.cargo = data.cargo;

      // Departamento
      if (data.department) updateData.departamento = data.department;
      if (data.departamento) updateData.departamento = data.departamento;

      // Turno
      if (data.shift) updateData.turno = data.shift;
      if (data.turno) updateData.turno = data.turno;

      // Jornada
      if (data.workday) updateData.jornada = data.workday;
      if (data.jornada) updateData.jornada = data.jornada;

      // Sistema de pensión

      if (data.pension) updateData.pension = data.pension;

      // Salario
      if (data.salary) {
        if (typeof data.salary === 'string' && data.salary.includes('S/.')) {
          updateData.salario = parseInt(data.salary.replace(/\D/g, ''));
        } else if (typeof data.salary === 'string') {
          updateData.salario = parseInt(data.salary.replace(/\D/g, ''));
        } else {
          updateData.salario = data.salary;
        }
      }
      if (data.salario) updateData.salario = data.salario;

      // Estado
      if (data.status) updateData.estado = data.status;
      if (data.estado) updateData.estado = data.estado;



      console.log('Datos a enviar al backend para actualizar contrato:', updateData);

      // Llamada real a la API
      return await http.put<Contrato>(`${BASE_PATH}/${id}`, updateData);
    } catch (error) {
      console.error(`Error al actualizar contrato con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Finalizar un contrato
   * @param id ID del contrato
   */
  finalize: async (id: string): Promise<Contrato> => {
    try {
      // Llamada real a la API
      return await http.post<Contrato>(`${BASE_PATH}/${id}/finalizar`, {});
    } catch (error) {
      console.error(`Error al finalizar contrato con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un contrato
   * @param id ID del contrato
   */
  delete: async (id: string): Promise<void> => {
    try {
      // Llamada real a la API
      await http.delete(`${BASE_PATH}/${id}`);
    } catch (error) {
      console.error(`Error al eliminar contrato con ID ${id}:`, error);
      throw error;
    }
  },
};
