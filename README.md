# Plataforma para la Estandarización de Procedimientos - Facultad de Ingeniería

Esta plataforma fue desarrollada con el objetivo de sistematizar y optimizar el proceso de estandarización de procedimientos dentro de la Facultad de Ingeniería, reemplazando los métodos manuales tradicionales por una solución tecnológica integral. El sistema facilita la documentación, el seguimiento y la mejora continua de los procedimientos estratégicos de la facultad.

Tomando como base la **Guía Metodológica para la Estandarización de Procedimientos de la Facultad de Ingeniería**, esta herramienta contribuye directamente al fortalecimiento del proyecto estratégico **FACING** y apoya los procesos de pensamiento estratégico de la institución, garantizando la organización, trazabilidad y control de todos los procedimientos desarrollados.

---

## 1. Requisitos del Sistema

Antes de instalar y ejecutar el proyecto, asegúrese de contar con las siguientes herramientas en su equipo:

*   **Sistema Operativo:** Windows 10/11 (Recomendado para garantizar la compatibilidad de todos los módulos).
*   **Node.js:** Versión 20 LTS o superior.
*   **npm:** Versión 10 o superior.
*   **MySQL Server:** Versión 8.x.
*   **Java Development Kit (JDK/JRE):** JDK versión 17.0 o JRE versión 8 (Requisito obligatorio para la generación de reportes con JasperReports).
*   **Angular CLI:** Versión 19.2.5 (El frontend fue generado con esta versión).

---

## 2. Estructura del Proyecto

El repositorio está organizado en una arquitectura desacoplada:

*   **`/` (Raíz del repositorio):** Contiene la aplicación Frontend desarrollada en **Angular**.
*   **`/backend`:** Contiene la API REST desarrollada en **NestJS** utilizando **TypeORM**.
*   **`/backend/jasper`:** Aloja las plantillas (.jrxml) y librerías necesarias para la generación de reportes en formato PDF.
*   **Base de Datos:** MySQL (gestionada a través de las entidades del backend).

---

## 3. Clonar y Preparar el Proyecto

Siga estos pasos para descargar el proyecto e instalar las dependencias de ambos entornos:

**Clonar el repositorio:**
```bash
git clone [https://github.com/Nelsonboli/estandarizacion.git](https://github.com/Nelsonboli/estandarizacion.git)
cd estandarizacion
```

**Instalar dependencias del frontend (raíz):**
```bash
npm install
```

**Instalar dependencias del backend:**
```bash
cd backend
npm install
cd ..
```

## 4. Configuración de base de datos (MySQL)
La conexión del backend está definida en el archivo:
- `backend/src/app.module.ts`
**Credenciales por defecto**:
- Host: `localhost`
- Puerto: `3306`
- Usuario: `root`
- Contraseña: `udenar123`
- Base de datos: `estandarizacion_de_procedimientos`
  
**Importante:** Debe crear la base de datos manualmente en su gestor de MySQL antes de iniciar el backend. Puede hacerlo ejecutando la siguiente sentencia SQL:

```sql
CREATE DATABASE estandarizacion_de_procedimientos;
```
**Nota:** El proyecto tiene activa la propiedad synchronize: true en TypeORM, lo que significa que las tablas y relaciones se generarán automáticamente en la base de datos al arrancar el backend por primera vez.

## 5. Configuración especial para reportes (Jasper + Java)
El backend genera reportes PDF usando Java/Jasper. Verifique que `java` esté en `PATH`:

```bash
java -version
```
- Si no es asi instale Java Runtime (JRE/JDK): versión 8  para JRE y  version 17.0 para JDK (requerido para JasperReports).

**Ruta de Imágenes para Diagramas de Flujo:** existe una ruta estática configurada para la lectura de los recursos visuales de los reportes. Si requiere modificar la ruta de almacenamiento de las imágenes de los diagramas, puede hacerlo en el archivo:
- `backend/src/modules/estandarizacion/reportes/reporte-DAAC/reports.service.ts`

## 6. Ejecutar el backend
Navegue al directorio del backend (si no se encuentra en él):
```bash
cd backend
```
-Inicie el servidor de desarrollo:
```bash
npm run start:dev
```
El backend estará disponible y escuchando peticiones en:
- `http://localhost:3000`

## 7. Ejecutar el frontend
Desde la raíz del repositorio, ejecute el siguiente comando::
```bash
npm start
```
El frontend compilará la aplicación y abrirá el servidor de desarrollo en:
- `http://localhost:4200`

**Nota de conectividad:**
- El backend permite CORS para `http://localhost:4200`.
- Los servicios del frontend están configurados con URLs de backend en `http://localhost:3000`.

## 8. Flujo recomendado de ejecución (para jurado)

1. Iniciar MySQL.
2. Crear base de datos `estandarizacion_de_procedimientos`.
3. Ejecutar backend (`npm run start:dev` en `backend`).
4. Ejecutar frontend (`npm start` en la raíz).
5. Abrir `http://localhost:4200`.

## 9. Verificación rápida

- Backend responde sin errores de conexión a MySQL.
- Frontend carga menú principal.
- Operaciones CRUD funcionan desde la interfaz.
- Descarga/generación de reportes PDF funciona (si Java está instalado).

## test unitario 
Para ejecutar un test unitario puedes hacerlo con [Karma](https://karma-runner.github.io)  use el siguiente comando para realizar el test:
El proyecto utiliza Karma para las pruebas del frontend. Para ejecutar la suite de pruebas unitarias automatizadas, utilice el comando de Angular CLI en la raíz del proyecto:
```bash
ng test
```

## Recursos adicionales

para mas informacion de uso de angular CLI, incluir detalladamente los comandos de referencias, visita [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
