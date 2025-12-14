/**
 * Cliente HTTP base para realizar peticiones a la API
 *
 * Este archivo centraliza la configuración de las peticiones HTTP,
 * incluyendo la URL base, headers, interceptores para tokens, y manejo de errores.
 */

// En una aplicación real, usaríamos axios o fetch con más configuración
// Por ahora, implementamos una versión simple para simular peticiones

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Tipos para las peticiones
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
};

// Servicio de tokens habilitado para autenticación
import { tokenService } from '../auth';

// Función para construir la URL con parámetros
const buildUrl = (endpoint: string, params?: Record<string, string>): string => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (!params) return url;

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value);
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};

// Cliente HTTP
const http = {
  request: async <T>(
    method: HttpMethod,
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    const { headers = {}, params, body } = options;

    // Autenticación habilitada - obtener token JWT
    const token = tokenService.getToken();
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    // Construir URL con parámetros
    const url = buildUrl(endpoint, params);

    // Configurar opciones de la petición
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers,
      },
      ...(body && { body: JSON.stringify(body) }),
    };

    try {
      // Registrar la petición en consola en modo desarrollo
      console.log(`[HTTP] ${method} ${url}`, body ? { body } : '');

      // Código para producción (petición real)
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        console.error(`Error HTTP ${response.status} en ${url}`, {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        });

        try {
          const errorData = await response.json();

          // Verificar si es un error de "NO AUTORIZADO"
          if (response.status === 401) {
            console.warn('Acceso no autorizado a la API - Token inválido o expirado');
            
            // Limpiar token inválido
            tokenService.removeToken();
            
            // Redirigir a login si no estamos ya ahí
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
            
            throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
          }

          console.error('Datos del error:', errorData);
          throw new Error(errorData.message || `Error HTTP: ${response.status}`);
        } catch (jsonError) {
          // Si no podemos parsear la respuesta como JSON
          const errorText = await response.text().catch(() => '');
          console.error('Respuesta de error (texto):', errorText);
          throw new Error(`Error HTTP: ${response.status} - ${response.statusText || errorText || 'Sin detalles'}`);
        }
      }

      try {
        // Intentar obtener el texto de la respuesta primero
        const responseText = await response.text();

        // Mostrar logs de respuesta
        console.log(`[HTTP Response] ${method} ${url} - Status: ${response.status}`);

        // Limitar el tamaño del log para evitar saturar la consola
        const maxLogLength = 500;
        const logText = responseText.length > maxLogLength
          ? responseText.substring(0, maxLogLength) + '... (truncado)'
          : responseText;
        console.log('Response text:', logText);

        // Si la respuesta está vacía, devolver un array vacío o un objeto vacío según el método
        if (!responseText.trim()) {
          console.warn('Respuesta vacía del servidor');
          return (method === 'GET' ? [] : {}) as T;
        }

        // Intentar parsear el texto como JSON
        return JSON.parse(responseText) as T;
      } catch (error: any) {
        console.error('Error al parsear la respuesta JSON:', error);
        throw new Error('Error al procesar la respuesta del servidor: ' + (error.message || 'Error desconocido'));
      }
    } catch (error: any) {
      console.error(`Error en petición ${method} ${url}:`, error);
      throw error;
    }
  },

  // Métodos HTTP
  get: <T>(endpoint: string, options?: RequestOptions) =>
    http.request<T>('GET', endpoint, options),

  post: <T>(endpoint: string, data?: any, options?: RequestOptions) => {
    // Evitar múltiples llamadas idénticas en sucesión rápida
    console.log(`Iniciando POST a ${endpoint}`);
    return http.request<T>('POST', endpoint, { ...options, body: data });
  },

  put: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    http.request<T>('PUT', endpoint, { ...options, body: data }),

  patch: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    http.request<T>('PATCH', endpoint, { ...options, body: data }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    http.request<T>('DELETE', endpoint, options),
};

export default http;
