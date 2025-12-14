/**
 * Exportaciones centralizadas de todas las APIs
 *
 * Este archivo facilita la importación de las APIs desde cualquier parte de la aplicación.
 * En lugar de importar cada API individualmente, se puede importar todo desde este archivo.
 *
 * Ejemplo:
 * import { trabajadoresApi, contratosApi, authApi } from '@/services/api';
 */

// Exportar todas las APIs
export * from './trabajadores';
export * from './contratos';
export * from './nominas';
export * from '../auth';

// También se pueden exportar tipos comunes aquí si es necesario
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Constantes comunes para las APIs
export const API_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
};
