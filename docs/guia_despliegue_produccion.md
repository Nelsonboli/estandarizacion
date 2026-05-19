# Guía de Despliegue en Producción (Actualizada con Supabase Storage)

Esta guía detalla el plan paso a paso para desplegar tu aplicación de **Estandarización de Procedimientos** en la nube. Incorporamos tu excelente idea de utilizar **Supabase Storage** como almacén persistente de imágenes y documentos, solucionando el problema del almacenamiento efímero en servidores en la nube.

---

## 1. Arquitectura de Producción Propuesta

| Componente | Tecnología | Rol | Alojamiento |
| :--- | :--- | :--- | :--- |
| **Frontend** | Angular 19 | Interfaz de usuario. | **Vercel** (Gratuito y rápido) |
| **Backend** | NestJS + JRE Java | Lógica de negocio y generación de reportes Jasper. | **Railway** (Contenedor Docker) |
| **Base de Datos** | MySQL 8.x | Almacenar relaciones, datos de texto y metadatos. | **Railway MySQL** (1 clic) |
| **Almacenamiento** | **Supabase Storage** | Almacenar PDFs y las imágenes del diagrama de flujo. | **Supabase Buckets** (Gratis y persistente) |

### 💡 Por qué esta arquitectura es perfecta
Las plataformas de contenedores (como Railway o Render) tienen un **disco local efímero**: cada vez que el servidor se reinicia o se redespliega, todos los archivos guardados en el disco local se borran. Al guardar tus imágenes de diagramas de flujo y archivos PDF en **Supabase Storage**, tus archivos permanecen seguros para siempre, y el backend de NestJS simplemente los lee de allí cuando los necesita.

---

## 2. Preparar el Backend para Supabase Storage

Para conectar tu NestJS a Supabase, utilizaremos la librería oficial de Supabase.

### Paso A: Instalar la dependencia en el Backend
En la carpeta `backend/`, ejecuta:
```bash
npm install @supabase/supabase-js
```

### Paso B: Crear un Servicio de Almacenamiento en NestJS
Podemos crear un `StorageService` para gestionar las subidas, descargas y eliminaciones de archivos en tus Buckets de Supabase.

**Ejemplo de implementación (`backend/src/modules/storage/storage.service.ts`):**
```typescript
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;

  constructor() {
    // Estas variables se configurarán en Railway
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY; // API Key / Service Role
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Sube un buffer a un bucket de Supabase y retorna la URL pública del archivo
  async subirArchivo(bucket: string, rutaArchivo: string, fileBuffer: Buffer, contentType: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(rutaArchivo, fileBuffer, {
        contentType,
        upsert: true, // Reemplazar si ya existe
      });

    if (error) {
      throw new Error(`Error al subir a Supabase: ${error.message}`);
    }

    const { data: urlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(rutaArchivo);

    return urlData.publicUrl;
  }

  // Descarga un archivo desde Supabase (útil para que Jasper lo procese temporalmente)
  async descargarArchivo(bucket: string, rutaArchivo: string): Promise<Buffer> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .download(rutaArchivo);

    if (error) {
      throw new Error(`Error al descargar de Supabase: ${error.message}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // Elimina un archivo
  async eliminarArchivo(bucket: string, rutaArchivo: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([rutaArchivo]);

    if (error) {
      throw new Error(`Error al eliminar de Supabase: ${error.message}`);
    }
  }
}
```

---

## 3. Adaptaciones de Código en tus Servicios

A continuación, cómo adaptaremos los servicios que guardaban datos locales en Windows para que utilicen **Supabase Storage**.

### A. Guardar Diagramas de Flujo (`diagrama-flujo.service.ts`)
En lugar de escribir en `C:\\Users\\Udenar\\Desktop\\...`, convertiremos las imágenes en base64 recibidas a buffers y las subiremos a un bucket llamado `diagramas` en Supabase.

**Modificación lógica propuesta:**
```typescript
async guardarDiagrama(idDoc: number, data: CreateDiagramaFlujoDto) {
  // ... búsqueda del documento soporte
  const bucketName = 'diagramas';
  
  // Guardar imágenes individuales de las páginas del diagrama
  if (data.imagenes && data.imagenes.length > 0) {
    for (let i = 0; i < data.imagenes.length; i++) {
      const imgBase64 = data.imagenes[i];
      if (!imgBase64) continue;
      
      const cleanBase64 = imgBase64.includes(',') ? imgBase64.split(',')[1] : imgBase64;
      const imgBuffer = Buffer.from(cleanBase64, 'base64');
      
      // Ruta del archivo en el bucket: "procedimiento_123/pagina_1.png"
      const storagePath = `procedimiento_${idDoc}/pagina_${i + 1}.png`;
      await this.storageService.subirArchivo(bucketName, storagePath, imgBuffer, 'image/png');
    }
  }

  // Guardar PDF principal del diagrama
  if (data.pdf_diagrama) {
    const cleanBase64Score = data.pdf_diagrama.includes(',') ? data.pdf_diagrama.split(',')[1] : data.pdf_diagrama;
    const pdfBuffer = Buffer.from(cleanBase64Score, 'base64');
    
    const storagePath = `procedimiento_${idDoc}/diagrama_${idDoc}.pdf`;
    const publicUrl = await this.storageService.subirArchivo(bucketName, storagePath, pdfBuffer, 'application/pdf');
    
    // Guardamos la URL pública en la base de datos MySQL
    diag.ubicacion_diagrama = publicUrl;
    diag.documento_diagrama = `diagrama_${idDoc}.pdf`;
  }
  
  // ... guardar en MySQL
}
```

---

### B. Generar Reporte PDF con Jasper (`reports.service.ts`)
Dado que **JasperReports** (el motor de Java) necesita archivos físicos para renderizar las imágenes, la solución elegante es:
1. El backend de NestJS **descarga temporalmente** las imágenes del diagrama desde Supabase Storage a la carpeta `/tmp` de Railway.
2. JasperReports procesa el reporte leyendo las imágenes desde `/tmp`.
3. Al finalizar, el backend **elimina los archivos temporales** para no saturar el almacenamiento del contenedor.

**Flujo en `reports.service.ts`:**
```typescript
// 1. Crear directorio temporal local en el servidor de Railway
const tmpDir = path.join(process.cwd(), 'tmp', `reporte_${id}`);
fs.mkdirSync(tmpDir, { recursive: true });

// 2. Descargar las imágenes desde Supabase a la carpeta temporal local
const diagramImages = [];
for (let i = 1; i <= totalPaginas; i++) {
  try {
    const buffer = await this.storageService.descargarArchivo('diagramas', `procedimiento_${idDoc}/pagina_${i}.png`);
    const localImgPath = path.join(tmpDir, `pagina_${i}.png`);
    fs.writeFileSync(localImgPath, buffer);
    diagramImages.push({ ruta: localImgPath.replace(/\\/g, '/') });
  } catch (error) {
    // Si no tiene más páginas, salimos del bucle
    break;
  }
}
processedData['imagenes'] = diagramImages;

// 3. Ejecutar el proceso Java con Jasper en Linux usando el separador dinámico ':'
const isWindows = process.platform === 'win32';
const cpSeparator = isWindows ? ';' : ':';
const classpath = `..${cpSeparator}../lib/*`;

// ... ejecución de spawn('java', ...)

// 4. Tras finalizar, borrar la carpeta temporal
fs.rmSync(tmpDir, { recursive: true, force: true });
```

---

### C. Subir Formato DAAC (`reglamento.service.ts`)
Similar a los diagramas, los reglamentos se subirán a un bucket llamado `reglamentos` en Supabase.

**Modificación lógica propuesta:**
```typescript
async subirFormatoDAAC(id: number, file: Express.Multer.File) {
  const reglamento = await this.reglamentoRepository.findOne({ where: { id } });
  if (!reglamento) throw new HttpException('Reglamento no encontrado', HttpStatus.NOT_FOUND);

  const bucketName = 'reglamentos';
  const storagePath = `reglamento_${id}/${Date.now()}-${file.originalname}`;
  
  // Subir el archivo de buffer directo a Supabase
  const publicUrl = await this.storageService.subirArchivo(bucketName, storagePath, file.buffer, file.mimetype);

  // Guardar la URL pública en MySQL
  reglamento.formato_daac_subido = publicUrl;
  
  // ... actualizar estados y guardar en MySQL
}
```

---

## 4. Pasos en el Panel de Supabase

1. Entra a tu proyecto en [Supabase.com](https://supabase.com/).
2. En el menú lateral izquierdo, ve a la sección de **Storage** (icono de cubo de almacenamiento).
3. Haz clic en **"New Bucket"** y crea dos Buckets:
   * **`diagramas`**: Configúralo como **Public** (para que tu frontend pueda acceder directamente a los PDFs de los diagramas mediante URL).
   * **`reglamentos`**: Configúralo como **Public** o privado según tus requerimientos de seguridad.
4. Ve a **Project Settings** (icono de engranaje) -> **API**.
5. Copia los siguientes valores para utilizarlos en tus variables de entorno del Backend:
   * **Project URL** (ej: `https://xxxxxx.supabase.co`)
   * **API Key** (usa la `service_role` o la `anon` key dependiendo de si tus buckets tienen políticas RLS activas).

---

## 5. Variables de Entorno en Railway (Backend)

En el servicio de NestJS en Railway, agrega las siguientes variables de entorno en la pestaña **Variables**:

* `SUPABASE_URL` ➡️ `https://tu-proyecto.supabase.co`
* `SUPABASE_KEY` ➡️ `tu-api-key-de-supabase`
* `DB_HOST` ➡️ `${{MySQL.MYSQLHOST}}`
* `DB_PORT` ➡️ `${{MySQL.MYSQLPORT}}`
* `DB_USERNAME` ➡️ `${{MySQL.MYSQLUSER}}`
* `DB_PASSWORD` ➡️ `${{MySQL.MYSQLPASSWORD}}`
* `DB_DATABASE` ➡️ `${{MySQL.MYSQLDATABASE}}`
* `PORT` ➡️ `3000`

---

## Conclusión

El uso de **Supabase Storage** soluciona de forma definitiva e ingeniosa el almacenamiento de archivos. Mantiene tu servidor de NestJS ligero, rápido y libre de problemas por el disco local temporal de la nube.
