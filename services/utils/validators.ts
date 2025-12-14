/**
 * Utilidades para validación de datos
 * 
 * Este archivo contiene funciones para validar diferentes tipos de datos
 * como correos electrónicos, números de teléfono, cédulas, etc.
 */

/**
 * Valida si un correo electrónico tiene formato válido
 * @param email Correo electrónico a validar
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  
  // Expresión regular para validar correos electrónicos
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida si un número de teléfono tiene formato válido
 * @param phone Número de teléfono a validar
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  
  // Expresión regular para validar números de teléfono (9 dígitos)
  const phoneRegex = /^\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

/**
 * Valida si una cédula peruana tiene formato válido
 * @param cedula Número de cédula a validar
 */
export const isValidCedula = (cedula: string): boolean => {
  if (!cedula) return false;
  
  // Expresión regular para validar cédulas (8 dígitos)
  const cedulaRegex = /^\d{8}$/;
  return cedulaRegex.test(cedula.replace(/\s+/g, ''));
};

/**
 * Valida si un valor es un número
 * @param value Valor a validar
 */
export const isNumeric = (value: any): boolean => {
  if (value === null || value === undefined || value === '') return false;
  
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Valida si un valor es un número entero
 * @param value Valor a validar
 */
export const isInteger = (value: any): boolean => {
  if (!isNumeric(value)) return false;
  
  const num = parseFloat(value);
  return Number.isInteger(num);
};

/**
 * Valida si un valor es un número positivo
 * @param value Valor a validar
 */
export const isPositiveNumber = (value: any): boolean => {
  if (!isNumeric(value)) return false;
  
  return parseFloat(value) > 0;
};

/**
 * Valida si un valor es un número mayor o igual a un mínimo
 * @param value Valor a validar
 * @param min Valor mínimo
 */
export const isNumberGreaterOrEqual = (value: any, min: number): boolean => {
  if (!isNumeric(value)) return false;
  
  return parseFloat(value) >= min;
};

/**
 * Valida si un valor es un número menor o igual a un máximo
 * @param value Valor a validar
 * @param max Valor máximo
 */
export const isNumberLessOrEqual = (value: any, max: number): boolean => {
  if (!isNumeric(value)) return false;
  
  return parseFloat(value) <= max;
};

/**
 * Valida si un valor está dentro de un rango
 * @param value Valor a validar
 * @param min Valor mínimo
 * @param max Valor máximo
 */
export const isNumberInRange = (value: any, min: number, max: number): boolean => {
  if (!isNumeric(value)) return false;
  
  const num = parseFloat(value);
  return num >= min && num <= max;
};

/**
 * Valida si un string tiene una longitud mínima
 * @param value Valor a validar
 * @param minLength Longitud mínima
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  if (!value) return false;
  
  return value.length >= minLength;
};

/**
 * Valida si un string tiene una longitud máxima
 * @param value Valor a validar
 * @param maxLength Longitud máxima
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  if (!value) return true; // Un string vacío siempre cumple con la longitud máxima
  
  return value.length <= maxLength;
};

/**
 * Valida si un string tiene una longitud dentro de un rango
 * @param value Valor a validar
 * @param minLength Longitud mínima
 * @param maxLength Longitud máxima
 */
export const hasLengthInRange = (value: string, minLength: number, maxLength: number): boolean => {
  if (!value) return minLength === 0;
  
  return value.length >= minLength && value.length <= maxLength;
};

/**
 * Valida si un valor es requerido (no es null, undefined o string vacío)
 * @param value Valor a validar
 */
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  
  return true;
};

/**
 * Valida si un valor es un objeto válido
 * @param value Valor a validar
 */
export const isObject = (value: any): boolean => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

/**
 * Valida si un valor es un array
 * @param value Valor a validar
 */
export const isArray = (value: any): boolean => {
  return Array.isArray(value);
};

/**
 * Valida si un array tiene elementos
 * @param value Array a validar
 */
export const isNonEmptyArray = (value: any): boolean => {
  return isArray(value) && value.length > 0;
};
