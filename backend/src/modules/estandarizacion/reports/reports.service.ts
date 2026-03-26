import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { FormulariodaacService } from 'src/modules/estandarizacion/Estados/documento-soporte/components/formulariodaac/formulariodaac.service';
import { DocumentoSoporteService } from 'src/modules/estandarizacion/Estados/documento-soporte/documento-soporte/documento-soporte.service';
import { ProcedimientoService } from 'src/modules/identificacion-requerimientos/procedimiento.service';

@Injectable()
export class ReportService {

    constructor(private readonly procedimientoService: ProcedimientoService,
        private documentoSoporteService: DocumentoSoporteService,
        private formulariodaacService: FormulariodaacService
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
            throw new NotFoundException(`Procedimiento con ID ${id} no encontrado`);
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
                    // Otros arrays, por defecto coma mas espacio
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

        // 1.5️⃣ Obtener imágenes del diagrama de flujo si existen
        // Estas imágenes son generadas por el componente frontend y guardadas en una carpeta específica en el escritorio
        const baseDirDiagramas = 'C:\\Users\\Udenar\\Desktop\\Estandarizacion de procedimientos\\Diagrama de flujo';
        let nombreProcedimiento = (rawData.procedimiento?.trim() || 'sin-nombre').replace(/[/\\?%*:|"<>]/g, '-');
        let procDir = path.join(baseDirDiagramas, nombreProcedimiento);

        // Fallback: Si no existe con el nombre trim, intentar con el nombre original (para carpetas antiguas con espacios)
        if (!fs.existsSync(procDir)) {
            const rawNombre = (rawData.procedimiento || 'sin-nombre').replace(/[/\\?%*:|"<>]/g, '-');
            const rawCheck = path.join(baseDirDiagramas, rawNombre);
            if (fs.existsSync(rawCheck)) {
                this.logToFile(`Encontrado directorio con nombre original (sin trim): ${rawCheck}`);
                procDir = rawCheck;
                nombreProcedimiento = rawNombre; // Actualizamos para logs posteriores si es necesario
            } else {
                this.logToFile(`No encontrado ni con trim (${procDir}) ni original (${rawCheck})`);
            }
        }

        let diagramImages: { ruta: string }[] = [];
        if (fs.existsSync(procDir)) {
            try {
                const files = fs.readdirSync(procDir);
                // Filtrar solo las imágenes de página (pagina_1.png, pagina_2.png, etc.) y ordenarlas numéricamente
                diagramImages = files
                    .filter(file => file.startsWith('pagina_') && file.endsWith('.png'))
                    .sort((a, b) => {
                        const numA = parseInt(a.replace('pagina_', '').replace('.png', ''), 10);
                        const numB = parseInt(b.replace('pagina_', '').replace('.png', ''), 10);
                        return numA - numB;
                    })
                    .map(file => ({ ruta: path.join(procDir, file).replace(/\\/g, '/') })); // Reemplazamos \ por / para Jasper compatibility

                this.logToFile(`Encontradas ${diagramImages.length} imágenes para el procedimiento: ${nombreProcedimiento}`);
            } catch (error) {
                this.logToFile(`Error leyendo directorio de imágenes: ${error.message}`);
            }
        } else {
            this.logToFile(`No se encontró el directorio de imágenes: ${procDir}`);
        }
        processedData['imagenes'] = diagramImages;

        // 2️⃣ Preparar rutas
        const rootPath = path.resolve(process.cwd());
        const tmpPath = path.join(rootPath, 'tmp');
        const jasperPath = path.join(rootPath, 'jasper');
        const dataPath = path.join(tmpPath, `data_${id}.json`);
        const pdfPath = path.join(tmpPath, `reporte_${id}.pdf`);

        // Asegurar que el directorio tmp existe
        if (!fs.existsSync(tmpPath)) {
            fs.mkdirSync(tmpPath, { recursive: true });
        }

        // 3️⃣ Guardar JSON temporal
        fs.writeFileSync(dataPath, JSON.stringify([processedData]));

        // 4️⃣ Ejecutar Jasper
        return new Promise((resolve, reject) => {
            // Añadimos -Xmx256m para limitar el uso de memoria de Java y evitar errores de paginación
            const jasperProcess = spawn('java', [
                '-Xmx256m',
                '-cp',
                '.;lib/*',
                'JasperRenderer',
                'ReporteDAAC.jasper',
                '.',
                dataPath,
                pdfPath
            ], {
                cwd: jasperPath,
                shell: true
            });

            let errorOutput = '';
            jasperProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            jasperProcess.on('close', (code) => {
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
