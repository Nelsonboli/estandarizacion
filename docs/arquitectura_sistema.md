# Arquitectura del Sistema

El sistema "Estandarización" sigue una arquitectura **Cliente-Servidor** estructurada en torno a un backend robusto basado en **NestJS** y un frontend interactivo construido con **Angular**.

## 1. Patrón Arquitectónico Backend: Monolito Modular
El backend (NestJS) implementa una arquitectura basada en módulos, separando claramente las responsabilidades del dominio del negocio. Se han identificado los siguientes módulos principales en `src/modules`:
*   `estandarizacion`
*   `identificacion-requerimientos`
*   `socializacion`

## 2. Organización en Capas (Backend)
Cada módulo en el backend sigue una estricta arquitectura en capas:
*   **Controllers (Controladores):** Encargados de recibir las peticiones HTTP, validar los parámetros de entrada (usando DTOs y `class-validator`) y delegar la lógica al servicio correspondiente.
*   **Services (Servicios):** Contienen la lógica de negocio central de la aplicación.
*   **Repositories / ORM:** Se utiliza **TypeORM** para interactuar con la base de datos MySQL, abstrayendo las consultas SQL y manejando las entidades del sistema.

## 3. Arquitectura del Frontend (Angular)
El cliente está desarrollado como una SPA (Single Page Application) utilizando **Angular 19**.
*   **Componentes y Vistas:** Estructurados jerárquicamente para presentar la información al usuario, utilizando **CoreUI** para el diseño y **Tailwind CSS** para utilidades de estilo.
*   **Servicios HTTP:** Encargados de la comunicación con el Backend mediante el `HttpClient` de Angular y programación reactiva (`rxjs`).
*   **Interactividad Avanzada:** Se integra **JointJS** para el diseño, despliegue y edición interactiva de diagramas de flujo directamente en el navegador.

## 4. Comunicación entre Subsistemas
La comunicación entre el Frontend (Angular) y el Backend (NestJS) se realiza íntegramente a través de una **API REST**, intercambiando datos en formato JSON.

## 5. Reportes / Generación de Documentos
El backend cuenta con una integración especializada para la generación de reportes complejos mediante **JasperReports**, permitiendo la transformación de los datos del sistema en documentos estructurados (PDF). En paralelo, el sistema usa `jspdf` y `pdfmake` en el lado del cliente (frontend) para generar archivos y documentos dinámicamente.
