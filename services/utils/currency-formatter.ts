// Función para formatear moneda en formato S/ X,XXX.XX
export const formatCurrency = (amount: number): string => {
  if (amount === undefined || amount === null) return 'S/ 0.00';
  
  // Formatear el número con separador de miles y dos decimales
  const formattedAmount = amount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  // Agregar el prefijo de moneda con espacio
  return `S/ ${formattedAmount}`;
};

// Función para validar que un valor sea un número válido para moneda
export const isValidCurrencyValue = (value: any): boolean => {
  if (value === undefined || value === null) return false;
  
  // Convertir a número si es string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Verificar que sea un número y no sea NaN
  return typeof numValue === 'number' && !isNaN(numValue);
};

// Función para extraer solo el valor numérico de un string de moneda
export const extractNumericValue = (currencyString: string): number => {
  if (!currencyString) return 0;
  
  // Eliminar el símbolo de moneda, espacios y separadores de miles
  const numericString = currencyString
    .replace(/[S/]/g, '')  // Eliminar S/
    .replace(/\s/g, '')    // Eliminar espacios
    .replace(/,/g, '');    // Eliminar comas
  
  // Convertir a número
  const value = parseFloat(numericString);
  
  // Retornar 0 si no es un número válido
  return isNaN(value) ? 0 : value;
};

// Función para validar que un valor de salario cumpla con el mínimo requerido
export const isValidSalary = (salary: number): boolean => {
  // Validar que sea un número y que sea al menos 1025 (salario mínimo)
  return isValidCurrencyValue(salary) && salary >= 1025;
};
