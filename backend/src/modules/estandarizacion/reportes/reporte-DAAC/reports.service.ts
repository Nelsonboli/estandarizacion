import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { FormulariodaacService } from 'src/modules/estandarizacion/criterios/documento-soporte/components/formulariodaac/formulariodaac.service';
import { DocumentoSoporteService } from 'src/modules/estandarizacion/criterios/documento-soporte/documento-soporte/documento-soporte.service';
import { ProcedimientoService } from 'src/modules/identificacion-requerimientos/procedimiento.service';
import { StorageService } from 'src/modules/storage/storage.service';

@Injectable()
export class ReportService {

    constructor(
        private readonly procedimientoService: ProcedimientoService,
        private documentoSoporteService: DocumentoSoporteService,
        private formulariodaacService: FormulariodaacService,
        private readonly storageService: StorageService,
    ) { }

    private logToFile(message: string) {
        try {
            const logPath = path.join(process.cwd(), 'reports_debug.log');
            fs.appendFileSync(logPath, `${new Date().toISOString()} - ${message}\n`);
        } catch (e) {
            console.error('Failed to log to file:', e);
        }
    }

    async generarReporte(id: number): Promise<string> {
        // 1️⃣ Obtener datos usando el servicio existente
        const procedimiento = await this.procedimientoService.findOne(id);
        if (!procedimiento) {
            throw new NotFoundException(`Procedimiento no encontrado`);
        }

        // Obtener datos del formulario DAAC
        let daacData = {};
        const documentoSoporte = await this.documentoSoporteService.getPorProcedimiento(id);
        if (documentoSoporte) {
            const formulario = await this.formulariodaacService.findByDocumento(documentoSoporte.id);
            if (formulario) {
                // Convertir a objeto plano y extraer datos
                const plainForm = JSON.parse(JSON.stringify(formulario));
                // Omitimos el ID del formulario y la relación circular
                const { documentoSoporte: _, id: __, ...rest } = plainForm;
                daacData = rest;
            }
        }

        // Convertir procedimiento a objeto plano
        const plainProcedimiento = JSON.parse(JSON.stringify(procedimiento));

        // Combinar datos (procedimiento tiene prioridad para el ID)
        const rawData = {
            ...plainProcedimiento,
            ...daacData
        };

        // Procesar los datos para asegurar que los arrays se conviertan en strings (compatibilidad con Jasper)
        const processedData = {};
        for (const [key, value] of Object.entries(rawData)) {
            if (Array.isArray(value)) {
                if (['proveedores', 'insumos', 'recibe'].includes(key)) {
                    // Formato con guión y salto de línea
                    processedData[key] = value.map(item => `- ${item}`).join('\n');
                } else if (['requisitos', 'documentos', 'registros'].includes(key)) {
                    // Formato con viñeta y salto de línea
                    processedData[key] = value.map(item => `• ${item}`).join('\n');
                } else {
                    processedData[key] = value.join(', ');
                }
            } else if (value && typeof value === 'object') {
                processedData[key] = JSON.stringify(value);
            } else {
                processedData[key] = value;
            }
        }

        // Aseguramos que el ID sea el correcto (el del procedimiento solicitado)
        processedData['id'] = id;

        // Crear directorio temporal local para descargar las imágenes del diagrama de flujo desde Supabase Storage
        const tmpDir = path.join(process.cwd(), 'tmp', `reporte_${id}`);
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        let diagramImages: { ruta: string }[] = [];
        if (documentoSoporte) {
            const idDoc = documentoSoporte.id;
            // Descargar secuencialmente imágenes desde Supabase Storage a la carpeta local del servidor
            for (let i = 1; i <= 20; i++) {
                try {
                    const buffer = await this.storageService.descargarArchivo('diagramas', `procedimiento_${idDoc}/pagina_${i}.png`);
                    const localImgPath = path.join(tmpDir, `pagina_${i}.png`);
                    fs.writeFileSync(localImgPath, buffer);
                    diagramImages.push({ ruta: localImgPath.replace(/\\/g, '/') }); // Reemplazamos \ por / para Jasper compatibility
                } catch (error) {
                    // Salir del bucle si ya no hay más páginas en Supabase
                    break;
                }
            }
            this.logToFile(`Descargadas ${diagramImages.length} imágenes desde Supabase para el procedimiento ID Doc: ${idDoc}`);
        }
        processedData['imagenes'] = diagramImages;

        // 2️⃣ Preparar rutas
        const rootPath = path.resolve(process.cwd());
        const tmpPath = path.join(rootPath, 'tmp', 'daac');
        const jasperPath = path.join(rootPath, 'jasper');
        const dataPath = path.join(tmpPath, `data_${id}.json`);
        const pdfPath = path.join(tmpPath, `reporte_${id}.pdf`);

        // Asegurar que el directorio tmp/daac existe
        if (!fs.existsSync(tmpPath)) {
            fs.mkdirSync(tmpPath, { recursive: true });
        }

        // 3️⃣ Guardar JSON temporal
        fs.writeFileSync(dataPath, JSON.stringify([processedData]));

        // 4️⃣ Ejecutar Jasper
        return new Promise((resolve, reject) => {
            const isWindows = process.platform === 'win32';
            const cpSeparator = isWindows ? ';' : ':';
            const classpath = `..${cpSeparator}../lib/*`;

            // Añadimos -Xmx256m para limitar el uso de memoria de Java y evitar errores de paginación
            const jasperProcess = spawn('java', [
                '-Xmx256m',
                '-Dnet.sf.jasperreports.awt.ignore.missing.font=true',
                '-cp',
                classpath,
                'JasperRenderer',
                'ReporteDAAC.jasper',
                '.',
                dataPath,
                pdfPath
            ], {
                cwd: path.join(jasperPath, 'reporte-daac'),
                shell: true
            });

            let errorOutput = '';
            jasperProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            jasperProcess.on('close', (code) => {
                // Limpiar la carpeta temporal local con las imágenes descargadas
                try {
                    fs.rmSync(tmpDir, { recursive: true, force: true });
                } catch (e) {
                    console.warn(`No se pudo eliminar el directorio temporal ${tmpDir}: ${e.message}`);
                }

                if (code === 0) {
                    if (fs.existsSync(pdfPath)) {
                        resolve(pdfPath);
                    } else {
                        const errorMsg = 'El proceso terminó correctamente pero el PDF no fue encontrado';
                        this.logToFile(`ERROR: ${errorMsg}`);
                        reject(new InternalServerErrorException(errorMsg));
                    }
                } else {
                    const errorMsg = `Error generando PDF (codigo ${code}): ${errorOutput}`;
                    this.logToFile(`JASPER ERROR:\n${errorOutput}`);
                    console.error('Jasper Error:', errorOutput);
                    reject(new InternalServerErrorException(errorMsg));
                }
            });
        });
    }
}
