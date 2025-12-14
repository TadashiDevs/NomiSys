# NomiSys - Sistema de Gestión de Nóminas

Sistema completo de gestión de nóminas empresariales desarrollado con Next.js y Laravel, diseñado para cumplir con la normativa laboral peruana 2025.

## 📋 Características

- ✅ **Gestión de Trabajadores**: Registro completo con datos personales, DNI, estado civil, hijos, etc.
- 📄 **Gestión de Contratos**: Contratos indefinidos y a plazo fijo con validación de fechas
- 💰 **Cálculo de Nóminas**: Cálculo automático según normativa peruana (AFP/ONP, horas extras, asignaciones)
- 📊 **Dashboard Interactivo**: Estadísticas y gráficos en tiempo real
- 🔔 **Notificaciones**: Alertas de contratos por vencer
- 📑 **Generación de PDFs**: Boletas de pago descargables
- 🔐 **Autenticación**: Sistema JWT con roles y permisos

## 🛠️ Tecnologías

**Frontend:**
- Next.js 15
- TypeScript
- Tailwind CSS
- Radix UI
- Framer Motion

**Backend:**
- Laravel 11
- PHP 8.2+
- MySQL 8.0+
- JWT Authentication

## 📦 Requisitos Previos

- Node.js 18+ y pnpm
- PHP 8.2+
- Composer
- MySQL 8.0+
- Git

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/TadashiDevs/NomiSys.git
cd NomiSys
```

### 2. Configurar el Frontend

```bash
# Instalar dependencias
pnpm install

# Crear archivo de variables de entorno
cp .env.example .env

# Editar .env y configurar la URL del backend
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Configurar el Backend

```bash
cd "NomiSys Backend"

# Instalar dependencias de PHP
composer install

# Crear archivo de variables de entorno
cp .env.example .env

# Editar el archivo .env y configurar la base de datos:
# DB_DATABASE=nomisysbase
# DB_USERNAME=root
# DB_PASSWORD=tu_contraseña

# Generar la clave de la aplicación
php artisan key:generate

# Generar la clave JWT
php artisan jwt:secret

# Crear la base de datos
# Asegúrate de que MySQL esté corriendo y crea la base de datos:
# mysql -u root -p
# CREATE DATABASE nomisysbase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
# exit;

# Ejecutar las migraciones
php artisan migrate

# (Opcional) Poblar con datos de prueba
php artisan db:seed --class=NominaPeruSeeder
```

### 4. Configurar API de Consulta DNI (Opcional)

El sistema incluye una funcionalidad para consultar datos por DNI. Para habilitarla:

1. Abre el archivo `services/api/reniec.ts`
2. Busca la variable `API_RENIEC_URL`
3. Reemplaza `'#'` con la URL de tu API de consulta DNI
4. Configura los headers necesarios (token, etc.)

**APIs populares en Perú:**
- [apiperu.dev](https://apiperu.dev/) (Requiere token)
- [apis.net.pe](https://apis.net.pe/) (Requiere token)

Si no configuras una API, la búsqueda de DNI mostrará un error indicando que debes configurarla.

## ▶️ Ejecutar el Proyecto

### Backend (Terminal 1)

```bash
cd "NomiSys Backend"
php artisan serve
# El backend estará disponible en http://localhost:8000
```

### Frontend (Terminal 2)

```bash
# Desde la raíz del proyecto
pnpm dev
# El frontend estará disponible en http://localhost:3000
```

## 👤 Usuario de Prueba

Si ejecutaste el seeder, puedes usar estas credenciales:

```
Email: admin@nomisys.com
Contraseña: password123
```

## 📁 Estructura del Proyecto

```
NomiSys/
├── app/                    # Páginas de Next.js
├── components/             # Componentes React
├── services/              # Servicios de API
├── context/               # Context API
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades
├── public/                # Archivos estáticos
└── NomiSys Backend/       # Backend Laravel
    ├── app/               # Código de la aplicación
    ├── config/            # Configuraciones
    ├── database/          # Migraciones y seeders
    └── routes/            # Rutas de la API
```

## 🔧 Configuración Adicional

### CORS

El backend ya está configurado para aceptar peticiones desde `localhost:3000`. Si necesitas cambiar esto, edita:

```php
// NomiSys Backend/config/cors.php
'allowed_origins' => [
    'http://localhost:3000',
    // Agrega tus URLs aquí
],
```

### Variables de Entorno Importantes

**Frontend (.env):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend (.env):**
```env
APP_URL=http://localhost:8000
DB_DATABASE=nomisysbase
DB_USERNAME=root
DB_PASSWORD=
JWT_SECRET=tu_secreto_jwt
```

## 🧪 Comandos Útiles

### Frontend
```bash
pnpm dev          # Modo desarrollo
pnpm build        # Compilar para producción
pnpm start        # Ejecutar producción
pnpm lint         # Revisar código
```

### Backend
```bash
php artisan serve              # Servidor de desarrollo
php artisan migrate            # Ejecutar migraciones
php artisan db:seed            # Poblar base de datos
php artisan migrate:fresh --seed  # Resetear y poblar
php artisan cache:clear        # Limpiar caché
```

## ⚠️ Notas Importantes

1. **No subir archivos .env**: Los archivos `.env` contienen información sensible y no deben subirse al repositorio
2. **Cambiar JWT_SECRET**: En producción, genera un nuevo secreto JWT
3. **Actualizar APP_KEY**: Usa `php artisan key:generate` para generar una nueva clave
4. **Base de datos**: Asegúrate de que MySQL esté corriendo antes de ejecutar las migraciones
5. **Carpeta .next**: Esta carpeta se genera automáticamente y no debe subirse (ya está en .gitignore)

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verifica que MySQL esté corriendo
- Revisa las credenciales en el archivo `.env` del backend
- Asegúrate de que la base de datos exista

### Error 419 en el backend
- Limpia la caché: `php artisan config:clear && php artisan cache:clear`

### Error de CORS
- Verifica que la URL del frontend esté en `config/cors.php` del backend

### Error al instalar dependencias
```bash
# Frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Backend
rm -rf vendor composer.lock
composer install
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**TadashiDevs**

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: nueva característica'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes problemas o preguntas, abre un issue en GitHub.

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub
