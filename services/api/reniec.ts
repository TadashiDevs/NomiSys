/**
 * Servicio para consultar datos de ciudadanos a través de la API de RENIEC
 * 
 * ⚠️ IMPORTANTE: Debes configurar tu propia API de consulta de DNI
 * 
 * Para usar esta funcionalidad:
 * 1. Obtén acceso a una API de consulta de DNI (ejemplo: apis.net.pe, apiperu.dev, etc.)
 * 2. Configura la URL de tu API en la variable API_RENIEC_URL
 * 3. Ajusta los parámetros y headers según la documentación de tu API
 * 4. Asegúrate de que tu API devuelva los campos: nombres, apellidos, sexo, fecha_nacimiento
 * 
 * Ejemplo de APIs populares en Perú:
 * - https://apiperu.dev/ (Requiere token)
 * - https://apis.net.pe/ (Requiere token)
 */

// CONFIGURA AQUÍ LA URL DE TU API DE CONSULTA DNI
const API_RENIEC_URL = '#'; // Reemplaza con tu URL de API

/**
 * Consulta los datos de un ciudadano por su DNI
 * @param dni Número de DNI a consultar
 * @returns Datos del ciudadano o null si no se encuentra
 */
export async function consultarDniReniec(dni: string) {
  try {
    // Validar que el DNI tenga 8 dígitos
    if (!/^\d{8}$/.test(dni)) {
      throw new Error('El DNI debe tener 8 dígitos numéricos');
    }

    // ⚠️ DEBES CONFIGURAR TU API AQUÍ
    if (API_RENIEC_URL === '#') {
      throw new Error('Debes configurar tu propia API de consulta DNI en services/api/reniec.ts');
    }

    // Realizar la consulta a la API
    // NOTA: Ajusta los parámetros según la documentación de tu API
    const formData = new URLSearchParams();
    formData.append('dni', dni);

    console.log('Consultando DNI:', dni);

    const response = await fetch(API_RENIEC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // AGREGA AQUÍ TU TOKEN DE AUTENTICACIÓN SI ES NECESARIO
        // 'Authorization': 'Bearer TU_TOKEN_AQUI',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error al consultar el DNI: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Respuesta de la API:', data);

    // Verificar si la respuesta contiene los datos esperados
    if (!data) {
      throw new Error('No se recibió respuesta de la API');
    }

    // La API puede devolver un objeto con success: false cuando no encuentra datos
    if (data.success === false) {
      throw new Error(data.message || 'No se encontraron datos para el DNI proporcionado');
    }

    // Si la respuesta tiene la estructura esperada con el objeto data, la devolvemos directamente
    if (data.success && data.data) {
      // Asegurarse de que todos los campos necesarios existan
      if (!data.data.nombres) {
        data.data.nombres = "";
      }
      if (!data.data.apellidos) {
        data.data.apellidos = "";
      }
      if (!data.data.sexo) {
        data.data.sexo = "";
      }

      // Formatear la fecha de nacimiento si existe (de YYYY-MM-DD a DD/MM/YYYY)
      if (data.data.fecha_nacimiento && data.data.fecha_nacimiento.includes('-')) {
        const fechaParts = data.data.fecha_nacimiento.split('-');
        if (fechaParts.length === 3) {
          // Convertir de YYYY-MM-DD a DD/MM/YYYY
          data.data.fecha_nacimiento_formateada = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`;
        }
      }

      console.log('Datos procesados (estructura nueva):', data);
      return data;
    }

    // Para compatibilidad con el formato anterior
    // Formatear los datos para que coincidan con nuestro modelo
    console.log('Procesando datos de la API para formato interno (estructura antigua)');

    // Determinar el nombre completo
    let nombresCompletos = '';
    if (data.nombres_completos) {
      nombresCompletos = data.nombres_completos;
    } else if (data.nombres && data.apellido_paterno && data.apellido_materno) {
      nombresCompletos = `${data.nombres} ${data.apellido_paterno} ${data.apellido_materno}`.trim();
    } else if (data.nombre) {
      nombresCompletos = data.nombre;
    }

    // Determinar el sexo (mantener el valor original)
    let sexo = data.sexo || '';

    // Determinar la fecha de nacimiento
    let fechaNacimiento = null;
    if (data.fecha_nacimiento) {
      // Si la fecha está en formato YYYY-MM-DD, convertirla a DD/MM/YYYY
      if (data.fecha_nacimiento.includes('-')) {
        const fechaParts = data.fecha_nacimiento.split('-');
        if (fechaParts.length === 3) {
          fechaNacimiento = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`;
        } else {
          fechaNacimiento = data.fecha_nacimiento;
        }
      } else {
        fechaNacimiento = data.fecha_nacimiento;
      }
    }

    const resultado = {
      nombres_completos: nombresCompletos,
      fecha_nacimiento: fechaNacimiento,
      sexo: sexo,
    };

    console.log('Datos procesados (estructura antigua):', resultado);
    return resultado;
  } catch (error) {
    console.error('Error al consultar el DNI:', error);
    throw error;
  }
}
