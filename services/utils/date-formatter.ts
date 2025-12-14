/**
 * Utilidades para el manejo de fechas
 *
 * Este archivo contiene funciones para formatear, validar y manipular fechas
 * de manera consistente en toda la aplicación.
 */

// Formatos comunes
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DISPLAY_DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

/**
 * Formatea una fecha para mostrar al usuario en formato DD/MM/YYYY
 * @param dateString Fecha en formato string
 */
export const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return '';

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return '';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return '';
  }
};

/**
 * Formatea una fecha para enviar a la API en formato YYYY-MM-DD
 * @param date Fecha a formatear
 */
export const formatDateForApi = (date: Date | string | undefined): string => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';

    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error al formatear fecha para API:', error);
    return '';
  }
};

/**
 * Calcula la edad a partir de la fecha de nacimiento
 * @param birthDateString Fecha de nacimiento
 */
export const calculateAge = (birthDateString: string | Date | undefined): number => {
  if (!birthDateString) return 0;

  try {
    const birthDate = typeof birthDateString === 'string' ? new Date(birthDateString) : birthDateString;
    if (isNaN(birthDate.getTime())) return 0;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  } catch (error) {
    console.error('Error al calcular edad:', error);
    return 0;
  }
};

/**
 * Valida que una fecha sea válida
 * @param dateString Fecha a validar
 */
export const isValidDate = (dateString: string | Date | undefined): boolean => {
  if (!dateString) return false;

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return !isNaN(date.getTime());
  } catch (error) {
    console.error('Error al validar fecha:', error);
    return false;
  }
};

/**
 * Valida que una fecha sea posterior a otra
 * @param dateString Fecha a validar
 * @param referenceString Fecha de referencia
 */
export const isDateAfter = (
  dateString: string | Date | undefined,
  referenceString: string | Date | undefined
): boolean => {
  if (!dateString || !referenceString) return false;

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const reference = typeof referenceString === 'string' ? new Date(referenceString) : referenceString;

    if (isNaN(date.getTime()) || isNaN(reference.getTime())) return false;

    return date > reference;
  } catch (error) {
    console.error('Error al comparar fechas:', error);
    return false;
  }
};

/**
 * Valida que una fecha sea anterior a otra
 * @param dateString Fecha a validar
 * @param referenceString Fecha de referencia
 */
export const isDateBefore = (
  dateString: string | Date | undefined,
  referenceString: string | Date | undefined
): boolean => {
  if (!dateString || !referenceString) return false;

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const reference = typeof referenceString === 'string' ? new Date(referenceString) : referenceString;

    if (isNaN(date.getTime()) || isNaN(reference.getTime())) return false;

    return date < reference;
  } catch (error) {
    console.error('Error al comparar fechas:', error);
    return false;
  }
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 */
export const getCurrentDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Obtiene la fecha y hora actual en formato YYYY-MM-DD HH:MM:SS
 */
export const getCurrentDateTime = (): string => {
  const now = new Date();
  const date = getCurrentDate();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  return `${date} ${hours}:${minutes}:${seconds}`;
};
