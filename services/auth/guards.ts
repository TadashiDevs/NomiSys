/**
 * Guards de autenticación
 * 
 * Este archivo contiene funciones para verificar el estado de autenticación
 * y obtener información del usuario actual.
 */

import { User } from './types';
import tokenService from './tokenService';

/**
 * Verificar si el usuario está autenticado
 * @returns true si el usuario está autenticado, false en caso contrario
 */
export const isAuthenticated = (): boolean => {
  return tokenService.hasAuthData();
};

/**
 * Obtener el usuario actual
 * @returns Datos del usuario autenticado o null si no está autenticado
 */
export const getCurrentUser = (): User | null => {
  return tokenService.getAuthData();
};

/**
 * Verificar si el usuario tiene un rol específico
 * @param role Rol a verificar
 * @returns true si el usuario tiene el rol especificado, false en caso contrario
 */
export const hasRole = (role: 'admin' | 'user'): boolean => {
  const user = getCurrentUser();
  return !!user && user.role === role;
};

/**
 * Verificar si el usuario es administrador
 * @returns true si el usuario es administrador, false en caso contrario
 */
export const isAdmin = (): boolean => {
  return hasRole('admin');
};

// Exportar como objeto para facilitar los mocks en pruebas
const guards = {
  isAuthenticated,
  getCurrentUser,
  hasRole,
  isAdmin,
};

export default guards;
