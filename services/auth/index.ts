/**
 * Exportaciones centralizadas del módulo de autenticación
 */

export * from './types';
export { default as authService } from './authService';
export { default as tokenService } from './tokenService';
export { default as guards } from './guards';

// Para mantener compatibilidad con el código existente
// Exportamos authService como authApi
export { default as authApi } from './authService';
