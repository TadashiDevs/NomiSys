/**
 * API de Trabajadores
 *
 * Este archivo contiene todas las funciones para interactuar con la API
 * relacionada con los trabajadores (CRUD y operaciones específicas).
 */

import http from '../utils/http';
import { FormData as TrabajadorFormData } from '@/components/trabajadores/types';

// Tipos
export interface Trabajador {
  id: string;
  cedula: string;
  nombres_completos: string;
  fecha_nacimiento: string;
  edad: number;
  sexo: 'Masculino' | 'Femenino';
  email?: string;
  celular?: string;
  direccion?: string;
  departamento?: string;
  cargo?: string;
  fecha_ingreso?: string;
  estado: 'Activo' | 'Inactivo' | 'Retirado';
  motivo_inactividad?: string;
  salario?: string | number;
  estado_civil?: string;
  numero_hijos?: number;
  created_at?: string;
  updated_at?: string;

  // Propiedades para compatibilidad con el frontend
  name?: string;
  birthDate?: string;
  sex?: string;
  phone?: string;
  address?: string;
  department?: string;
  position?: string;
  joinDate?: string;
  status?: string;
  motivoInactividad?: string;
  maritalStatus?: string;
  children?: string;

  // Método para asegurar que siempre haya un nombre disponible
  getName?: () => string;
}

// Endpoints
const BASE_PATH = '/api/trabajadores';

// Los datos ahora vienen del backend

// API de Trabajadores
export const trabajadoresApi = {
  /**
   * Obtener todos los trabajadores
   * @param params Parámetros de filtrado (opcional)
   */
  // Cache para evitar múltiples llamadas innecesarias
  _cachedWorkers: null as Trabajador[] | null,

  getAll: async (params?: { status?: string; department?: string }): Promise<Trabajador[]> => {
    try {
      // Si ya tenemos trabajadores en caché, devolverlos directamente
      if (trabajadoresApi._cachedWorkers) {
        console.log('Devolviendo trabajadores desde caché:', trabajadoresApi._cachedWorkers.length);
        return trabajadoresApi._cachedWorkers;
      }

      // Llamada real a la API (solo si no hay caché)
      console.log('Obteniendo trabajadores desde la API (sin caché)');
      const response = await http.get<Trabajador[]>(BASE_PATH, { params });

      // Asegurarse de que los datos sean compatibles con el frontend
      const trabajadoresCompatibles = response.map(trabajador => {
        // Asegurarse de que el ID esté disponible como string
        if (trabajador.id && typeof trabajador.id !== 'string') {
          trabajador.id = String(trabajador.id);
        }

        // Asegurarse de que el campo 'name' esté disponible
        if (!trabajador.name && trabajador.nombres_completos) {
          trabajador.name = trabajador.nombres_completos;
        }

        // Asegurarse de que el campo 'status' esté disponible
        if (!trabajador.status && trabajador.estado) {
          trabajador.status = trabajador.estado;
        }

        // Asegurarse de que otros campos estén disponibles
        if (!trabajador.birthDate && trabajador.fecha_nacimiento) {
          trabajador.birthDate = trabajador.fecha_nacimiento;
        }

        if (!trabajador.phone && trabajador.celular) {
          trabajador.phone = trabajador.celular;
        }

        if (!trabajador.address && trabajador.direccion) {
          trabajador.address = trabajador.direccion;
        }

        if (!trabajador.department && trabajador.departamento) {
          trabajador.department = trabajador.departamento;
        }

        if (!trabajador.position && trabajador.cargo) {
          trabajador.position = trabajador.cargo;
        }

        if (!trabajador.joinDate && trabajador.fecha_ingreso) {
          trabajador.joinDate = trabajador.fecha_ingreso;
        }

        // Mapear estado civil y número de hijos
        if (!trabajador.maritalStatus && trabajador.estado_civil) {
          trabajador.maritalStatus = trabajador.estado_civil;
        }

        if (!trabajador.children && trabajador.numero_hijos !== undefined) {
          trabajador.children = String(trabajador.numero_hijos);
        }

        // Log eliminado para mejorar el rendimiento

        return trabajador;
      });

      // Guardar en caché para futuras llamadas
      trabajadoresApi._cachedWorkers = trabajadoresCompatibles;
      console.log('Trabajadores guardados en caché:', trabajadoresCompatibles.length);

      return trabajadoresCompatibles;
    } catch (error) {
      console.error('Error al obtener trabajadores:', error);
      throw error;
    }
  },

  /**
   * Obtener un trabajador por ID
   * @param id ID del trabajador
   */
  getById: async (id: string): Promise<Trabajador | null> => {
    try {
      // Llamada real a la API
      const trabajador = await http.get<Trabajador>(`${BASE_PATH}/${id}`);

      if (trabajador) {
        // Asegurarse de que el campo 'name' esté disponible
        if (!trabajador.name && trabajador.nombres_completos) {
          trabajador.name = trabajador.nombres_completos;
        }

        // Asegurarse de que el campo 'status' esté disponible
        if (!trabajador.status && trabajador.estado) {
          trabajador.status = trabajador.estado;
        }

        // Asegurarse de que otros campos estén disponibles
        if (!trabajador.birthDate && trabajador.fecha_nacimiento) {
          trabajador.birthDate = trabajador.fecha_nacimiento;
        }

        if (!trabajador.sex && trabajador.sexo) {
          trabajador.sex = trabajador.sexo;
        }

        if (!trabajador.phone && trabajador.celular) {
          trabajador.phone = trabajador.celular;
        }

        if (!trabajador.address && trabajador.direccion) {
          trabajador.address = trabajador.direccion;
        }

        if (!trabajador.department && trabajador.departamento) {
          trabajador.department = trabajador.departamento;
        }

        if (!trabajador.position && trabajador.cargo) {
          trabajador.position = trabajador.cargo;
        }

        if (!trabajador.joinDate && trabajador.fecha_ingreso) {
          trabajador.joinDate = trabajador.fecha_ingreso;
        }

        // Mapear estado civil y número de hijos
        if (!trabajador.maritalStatus && trabajador.estado_civil) {
          trabajador.maritalStatus = trabajador.estado_civil;
        }

        if (!trabajador.children && trabajador.numero_hijos !== undefined) {
          trabajador.children = String(trabajador.numero_hijos);
        }
      }

      return trabajador;
    } catch (error) {
      console.error(`Error al obtener trabajador con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo trabajador
   * @param data Datos del trabajador
   */
  create: async (data: TrabajadorFormData): Promise<Trabajador> => {
    try {
      // Preparar datos para el backend
      const trabajadorData = {
        cedula: data.cedula,
        nombres_completos: data.name, // Ahora usamos el nombre completo directamente
        fecha_nacimiento: data.birthDate?.toISOString().split('T')[0] || '',
        edad: data.birthDate ? new Date().getFullYear() - new Date(data.birthDate).getFullYear() : 0,
        sexo: data.sex,
        email: data.email,
        direccion: data.address,
        celular: data.phone,
        estado: data.status,
        motivo_inactividad: data.motivoInactividad,
        estado_civil: data.maritalStatus,
        numero_hijos: data.children ? parseInt(data.children) : 0,
      };

      // Llamada real a la API
      const result = await http.post<Trabajador>(BASE_PATH, trabajadorData);

      // Invalidar caché después de crear un nuevo trabajador
      trabajadoresApi._cachedWorkers = null;

      return result;
    } catch (error) {
      console.error('Error al crear trabajador:', error);
      throw error;
    }
  },

  /**
   * Actualizar un trabajador existente
   * @param id ID del trabajador
   * @param data Datos a actualizar
   */
  update: async (id: string, data: Partial<TrabajadorFormData>): Promise<Trabajador> => {
    try {
      // Preparar datos para el backend
      const updateData: any = {};

      if (data.name) {
        updateData.nombres_completos = data.name;
      }

      if (data.birthDate) {
        updateData.fecha_nacimiento = data.birthDate.toISOString().split('T')[0];
        updateData.edad = new Date().getFullYear() - new Date(data.birthDate).getFullYear();
      }

      if (data.sex) updateData.sexo = data.sex;
      if (data.email) updateData.email = data.email;
      if (data.address) updateData.direccion = data.address;
      if (data.phone) updateData.celular = data.phone;
      if (data.status) updateData.estado = data.status;
      if (data.motivoInactividad) updateData.motivo_inactividad = data.motivoInactividad;
      if (data.maritalStatus) updateData.estado_civil = data.maritalStatus;
      if (data.children) updateData.numero_hijos = data.children;

      console.log('Datos a enviar al backend:', updateData);

      // Llamada real a la API
      const result = await http.put<Trabajador>(`${BASE_PATH}/${id}`, updateData);

      // Invalidar caché después de actualizar un trabajador
      trabajadoresApi._cachedWorkers = null;

      return result;
    } catch (error) {
      console.error(`Error al actualizar trabajador con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cambiar el estado de un trabajador
   * @param id ID del trabajador
   * @param status Nuevo estado
   * @param motivo Motivo del cambio (requerido para Inactivo o Retirado)
   */
  updateStatus: async (
    id: string,
    status: 'Activo' | 'Inactivo' | 'Retirado',
    motivo?: string
  ): Promise<Trabajador> => {
    try {
      // Preparar datos para el backend
      const updateData = {
        estado: status,
        motivo_inactividad: status !== 'Activo' ? motivo : null
      };

      // Llamada real a la API
      const result = await http.patch<Trabajador>(`${BASE_PATH}/${id}/status`, updateData);

      // Invalidar caché después de cambiar el estado de un trabajador
      trabajadoresApi._cachedWorkers = null;

      return result;
    } catch (error) {
      console.error(`Error al actualizar estado del trabajador con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un trabajador
   * @param id ID del trabajador
   */
  delete: async (id: string): Promise<void> => {
    try {
      // Llamada real a la API
      await http.delete(`${BASE_PATH}/${id}`);

      // Invalidar caché después de eliminar un trabajador
      trabajadoresApi._cachedWorkers = null;
    } catch (error) {
      console.error(`Error al eliminar trabajador con ID ${id}:`, error);
      throw error;
    }
  },

  // Alias para compatibilidad
  obtenerTodos: async (params?: { status?: string; department?: string }): Promise<Trabajador[]> => {
    return trabajadoresApi.getAll(params);
  },
};
