/**
 * Servicio de autenticación
 *
 * Este servicio se encarga de todas las operaciones relacionadas con la autenticación:
 * - Login y logout
 * - Registro de usuarios
 * - Recuperación de contraseña
 * - Actualización de perfil
 */

import http from '../utils/http';
import { User, LoginCredentials, RegisterData } from './types';
import tokenService from './tokenService';
import guards from './guards';

/**
 * Servicio de autenticación
 */
const authService = {
  /**
   * Iniciar sesión
   * @param credentials Credenciales de inicio de sesión
   */
  login: async (credentials: LoginCredentials): Promise<User> => {
    try {
      // Llamada a la API de autenticación
      const response = await http.post<{ access_token: string, token_type: string, expires_in: number, user: User }>('/api/auth/login', credentials);

      // Extraer datos de la respuesta
      const { access_token, user } = response;

      // Crear objeto de usuario con token
      const userWithToken: User = {
        ...user,
        token: access_token
      };

      // Guardar en localStorage
      tokenService.saveToken(userWithToken);

      return userWithToken;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  },

  /**
   * Registrar un nuevo usuario
   * @param data Datos de registro
   */
  register: async (data: RegisterData): Promise<void> => {
    try {
      // Llamada a la API para registrar usuario
      await http.post('/api/auth/register', data);
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  },

  /**
   * Cerrar sesión
   */
  logout: async (): Promise<void> => {
    try {
      // Llamada a la API para invalidar el token
      await http.post('/api/auth/logout');

      // Eliminar datos de autenticación del localStorage
      tokenService.removeToken();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Incluso si hay un error, eliminamos los datos locales
      tokenService.removeToken();
    }
  },

  /**
   * Solicitar recuperación de contraseña
   * @param email Correo electrónico
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    try {
      // En producción, esto sería una llamada real a la API
      // await http.post('/auth/password-reset-request', { email });

      // Simulación para desarrollo
      await new Promise(resolve => setTimeout(resolve, 800));

      // Validación simple para desarrollo
      if (!email) {
        throw new Error('El correo electrónico es requerido');
      }

      // En una aplicación real, aquí se enviaría un correo de recuperación
      console.log('Solicitud de recuperación enviada a:', email);
    } catch (error) {
      console.error('Error al solicitar recuperación de contraseña:', error);
      throw error;
    }
  },

  /**
   * Restablecer contraseña
   * @param token Token de recuperación
   * @param newPassword Nueva contraseña
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    try {
      // En producción, esto sería una llamada real a la API
      // await http.post('/auth/password-reset', { token, newPassword });

      // Simulación para desarrollo
      await new Promise(resolve => setTimeout(resolve, 800));

      // Validación simple para desarrollo
      if (!token || !newPassword) {
        throw new Error('Token y nueva contraseña son requeridos');
      }

      // En una aplicación real, aquí se restablecería la contraseña
      console.log('Contraseña restablecida con token:', token);
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      throw error;
    }
  },

  /**
   * Actualizar perfil de usuario
   * @param data Datos a actualizar
   */
  updateProfile: async (data: Partial<Omit<User, 'token'>>): Promise<User> => {
    try {
      // En producción, esto sería una llamada real a la API
      // const updatedUser = await http.put<User>('/auth/profile', data);

      // Simulación para desarrollo
      await new Promise(resolve => setTimeout(resolve, 500));

      // Obtener usuario actual
      const currentUser = guards.getCurrentUser();
      if (!currentUser) {
        throw new Error('No hay usuario autenticado');
      }

      // Actualizar datos
      const updatedUser = tokenService.updateAuthData(data);
      if (!updatedUser) {
        throw new Error('Error al actualizar perfil');
      }

      return updatedUser;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  },

  // Exportar guards para mantener compatibilidad
  isAuthenticated: guards.isAuthenticated,
  getCurrentUser: guards.getCurrentUser,
  hasRole: guards.hasRole,
  isAdmin: guards.isAdmin,
};

export default authService;
