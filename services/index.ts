/**
 * Exportaciones centralizadas de todos los servicios
 *
 * Este archivo facilita la importación de los servicios desde cualquier parte de la aplicación.
 *
 * Ejemplo:
 * import { api, utils } from '@/services';
 */

// Exportar APIs
import * as api from './api';
export { api };

// Exportar utilidades
import * as dateUtils from './utils/date-formatter';
import * as validators from './utils/validators';

export const utils = {
  date: dateUtils,
  validators: validators,
};

// Exportar cliente HTTP para uso directo si es necesario
export { default as http } from './utils/http';
