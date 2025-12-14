/**
 * Tipos relacionados con la autenticación
 */

/**
 * Datos del usuario autenticado
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  token: string;
}

/**
 * Credenciales para iniciar sesión
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Datos para registrar un nuevo usuario
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}
