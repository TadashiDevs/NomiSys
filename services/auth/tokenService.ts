/**
 * Servicio de gestión de tokens
 * 
 * Este servicio se encarga de todas las operaciones relacionadas con tokens:
 * - Almacenamiento y recuperación de tokens
 * - Verificación de tokens
 * - Gestión del estado de autenticación en localStorage
 */

import { User } from './types';

// Clave para almacenar el estado de autenticación en localStorage
export const AUTH_KEY = 'nomisys_auth';

/**
 * Guardar información de autenticación en localStorage
 * @param user Datos del usuario autenticado
 */
export const saveToken = (user: User): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error al guardar token:', error);
  }
};

/**
 * Eliminar información de autenticación de localStorage
 */
export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch (error) {
    console.error('Error al eliminar token:', error);
  }
};

/**
 * Obtener el token de autenticación
 * @returns Token de autenticación o null si no existe
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const authData = localStorage.getItem(AUTH_KEY);
    if (!authData) return null;
    
    const user = JSON.parse(authData);
    return user.token || null;
  } catch (error) {
    console.error('Error al obtener token de autenticación:', error);
    return null;
  }
};

/**
 * Obtener los datos del usuario autenticado
 * @returns Datos del usuario o null si no está autenticado
 */
export const getAuthData = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const authData = localStorage.getItem(AUTH_KEY);
    if (!authData) return null;
    
    return JSON.parse(authData) as User;
  } catch (error) {
    console.error('Error al obtener datos de autenticación:', error);
    return null;
  }
};

/**
 * Verificar si existe información de autenticación
 * @returns true si existe información de autenticación, false en caso contrario
 */
export const hasAuthData = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const authData = localStorage.getItem(AUTH_KEY);
  return !!authData;
};

/**
 * Actualizar datos del usuario autenticado
 * @param userData Datos actualizados del usuario
 */
export const updateAuthData = (userData: Partial<User>): User | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const currentUser = getAuthData();
    if (!currentUser) return null;
    
    const updatedUser: User = {
      ...currentUser,
      ...userData,
    };
    
    saveToken(updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('Error al actualizar datos de autenticación:', error);
    return null;
  }
};

// Exportar como objeto para facilitar los mocks en pruebas
const tokenService = {
  saveToken,
  removeToken,
  getToken,
  getAuthData,
  hasAuthData,
  updateAuthData,
  AUTH_KEY,
};

export default tokenService;
