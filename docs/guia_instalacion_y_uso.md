# Guía de instalación y uso

Este documento describe cómo instalar y ejecutar el proyecto **Estandarización de Procedimientos** para revisión académica.

## 1) Requisitos del sistema

- Sistema operativo: Windows 10/11 (recomendado, por rutas configuradas en el backend).
- Node.js: versión 20 LTS o superior.
- npm: versión 10 o superior.
- MySQL Server: versión 8.x.
- Java Runtime (JRE/JDK): versión 8 o superior (requerido para JasperReports).
- Git.

## 2) Estructura del proyecto

- `frontend` y raíz del repositorio: aplicación Angular.
- `backend`: API REST con NestJS + TypeORM.
- `backend/jasper`: plantillas y librerías para generación de reportes PDF.
- `docs`: documentación técnica.

## 3) Clonar y preparar el proyecto

```bash
git clone <URL_DEL_REPOSITORIO>
cd estandarizacion
```

## 4) Instalación de dependencias

Instalar dependencias del frontend (raíz):

```bash
npm install
```

Instalar dependencias del backend:

```bash
cd backend
npm install
cd ..
```

## 5) Configuración de base de datos (MySQL)

La conexión del backend está definida en:

- `backend/src/app.module.ts`

Configuración actual:

- Host: `localhost`
- Puerto: `3306`
- Usuario: `root`
- Contraseña: `udenar123`
- Base de datos: `estandarizacion_de_procedimientos`

Crear la base de datos antes de ejecutar el backend:

```sql
CREATE DATABASE estandarizacion_de_procedimientos;
```

Nota: el proyecto usa `synchronize: true` en TypeORM, por lo que las tablas se crean automáticamente al iniciar el backend.

## 6) Requisito especial para reportes (Jasper + Java)

El backend genera reportes PDF usando Java/Jasper. Verifique que `java` esté en `PATH`:

```bash
java -version
```

Además, existe una ruta fija para leer imágenes del diagrama de flujo:

`C:\Users\Udenar\Desktop\Estandarizacion de procedimientos\Diagrama de flujo`

Si se desea usar la funcionalidad completa de reportes con imágenes, crear esa ruta o ajustar el código en:

- `backend/src/modules/estandarizacion/reportes/reporte-DAAC/reports.service.ts`

## 7) Ejecutar el backend

Desde `backend`:

```bash
npm run start:dev
```

El backend inicia en:

- `http://localhost:3000`

## 8) Ejecutar el frontend

Desde la raíz del repositorio:

```bash
npm start
```

El frontend inicia en:

- `http://localhost:4200`

Importante:

- El backend permite CORS para `http://localhost:4200`.
- Los servicios del frontend están configurados con URLs de backend en `http://localhost:3000`.

## 9) Flujo recomendado de ejecución (para jurado)

1. Iniciar MySQL.
2. Crear base de datos `estandarizacion_de_procedimientos`.
3. Ejecutar backend (`npm run start:dev` en `backend`).
4. Ejecutar frontend (`npm start` en la raíz).
5. Abrir `http://localhost:4200`.

## 10) Verificación rápida

- Backend responde sin errores de conexión a MySQL.
- Frontend carga menú principal.
- Operaciones CRUD funcionan desde la interfaz.
- Descarga/generación de reportes PDF funciona (si Java está instalado).

## 11) Comandos útiles

Frontend (raíz):

```bash
npm start
npm run build
npm test
```

Backend (`backend`):

```bash
npm run start:dev
npm run build
npm run test
npm run test:e2e
```

## 12) Problemas comunes y solución

- Error de conexión MySQL:
  - Verificar que MySQL esté activo.
  - Revisar credenciales en `backend/src/app.module.ts`.
  - Confirmar que la base de datos exista.

- Error `java is not recognized`:
  - Instalar JDK/JRE.
  - Agregar Java al `PATH`.
  - Reintentar `java -version`.

- Error CORS o frontend sin datos:
  - Confirmar backend en `http://localhost:3000`.
  - Confirmar frontend en `http://localhost:4200`.

- Falla al generar reportes con imágenes:
  - Verificar la ruta fija:
    `C:\Users\Udenar\Desktop\Estandarizacion de procedimientos\Diagrama de flujo`
  - Verificar existencia de imágenes `pagina_1.png`, `pagina_2.png`, etc.

## 13) Recomendación para publicación académica

Antes de compartir al jurado:

- Incluir este documento en el repositorio.
- Incluir un respaldo de base de datos (`.sql`) opcional para pruebas rápidas.
- Si es posible, reemplazar credenciales fijas por variables de entorno para facilitar despliegue en otros equipos.
