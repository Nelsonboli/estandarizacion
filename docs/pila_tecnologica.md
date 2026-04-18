# Pila Tecnológica (Tech Stack)

El sistema "Estandarización" está construido sobre las siguientes tecnologías y herramientas:

## Frontend (Cliente)
*   **Framework Principal:** Angular 19 (`@angular/core` ^19.2.0)
*   **Lenguaje:** TypeScript 5.7.2
*   **Estilos y Componentes UI:**
    *   **Tailwind CSS:** ^4.1.8 para estilos utilitarios y diseño rápido.
    *   **CoreUI:** ~5.2.0 / ~5.4.14 para componentes de interfaz de usuario robustos (`@coreui/angular`).
    *   **Angular Material:** Componentes adicionales de UI (`@angular/material` ^19.2.18).
    *   **SweetAlert2:** Para modales, alertas enriquecidas y retroalimentación al usuario.
*   **Interactividad e Interfaz Gráfica:**
    *   **JointJS:** 3.7.7 - Herramienta fundamental para la visualización, creación y mapeo de diagramas de flujo.
*   **Generación de Documentos Expuestos:**
    *   `jspdf` (^3.0.4) y `jspdf-autotable` para generación de PDFs.
    *   `pdfmake` y `pdf-lib` para manipulación de PDFs.
    *   `html2canvas` / `html-to-image` para captura de elementos del DOM.

## Backend (Servidor)
*   **Framework Principal:** NestJS 11 (`@nestjs/core` ^11.0.1)
*   **Entorno de Ejecución:** Node.js
*   **Lenguaje:** TypeScript 5.7.3
*   **Gestión de Base de Datos y ORM:**
    *   **Base de Datos:** MySQL (`mysql2` ^3.16.2).
    *   **ORM:** TypeORM (`@nestjs/typeorm` ^11.0.0, `typeorm` ^0.3.27) para el modelo y persistencia de datos.
*   **Validaciones:**
    *   `class-validator` y `class-transformer` para la validación tipada de datos en las peticiones (Payloads/DTOs).
*   **Reportes / Integraciones:**
    *   **JasperReports:** Para documentaciones de plantillas (`ReporteDAAC.jasper`) mediante reportes del lado del servidor.

## Herramientas de Desarrollo
*   **Gestor de Paquetes:** npm
*   **Linter y Formateo:** `eslint` (v9) y `prettier` para mantener los estándares de código.
*   **Testing:** `Jasmine` / `Karma` (Frontend) y `Jest` (Backend).
*   **Generador UML Extra:** `plantuml.jar` (PlantUML) identificado en la raíz del proyecto para generación independiente de diagramas de arquitectura o de sistema (`.puml`).
