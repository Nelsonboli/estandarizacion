import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { FormulariodaacService } from 'src/modules/estandarizacion/criterios/documento-soporte/components/formulariodaac/formulariodaac.service';
import { DocumentoSoporteService } from 'src/modules/estandarizacion/criterios/documento-soporte/documento-soporte/documento-soporte.service';
import { ProcedimientoService } from 'src/modules/identificacion-requerimientos/procedimiento.service';
import { DataSource } from 'typeorm';

@Injectable()
export class FormatoEstandarizacionService {
  constructor(
    private readonly procedimientoService: ProcedimientoService,
    private documentoSoporteService: DocumentoSoporteService,
    private formulariodaacService: FormulariodaacService,
    private readonly dataSource: DataSource
  ) { }

  private logToFile(message: string) {
    try {
      const logPath = path.join(process.cwd(), 'reports_debug.log');
      fs.appendFileSync(logPath, `${new Date().toISOString()} - ${message}\n`);
    } catch (e) {
      console.error('Failed to log to file:', e);
    }
  }

  async generarReporteEstandarizacion(id: number): Promise<string> {
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
        } else if (['actividades', 'roles', 'referencias'].includes(key)) {
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

    // ----------------------
    // INTEGRACIÓN DE NUEVOS CAMPOS SOLICITADOS
    // ----------------------
    const pNombre = procedimiento.procedimiento || '';

    // 1. Recolección de Información
    const queryRecoleccion = await this.dataSource.query(`SELECT * FROM recoleccion_informacion WHERE procedimiento_id = ?`, [id]);
    const recoleccion: any = queryRecoleccion[0];
    let recoleccionStr = '';
    if (recoleccion) {
      const mecanismos: string[] = [];
      if (recoleccion.revision_documental) mecanismos.push('revisión documental');
      if (recoleccion.consulta) mecanismos.push('consulta');
      if (recoleccion.observacion_directa) mecanismos.push('observación directa');

      if (mecanismos.length > 0) {
        let mecanismosText = mecanismos.join(', ');
        if (mecanismos.length > 1) {
          mecanismosText = mecanismosText.replace(/, ([^,]*)$/, ' y $1');
        }
        recoleccionStr = `Para la recoleccion de información del ${pNombre} se utilizaron los siguientes mecanismos ${mecanismosText}.`;
      }
    }
    processedData['recoleccion_informacion'] = recoleccionStr;

    // 2. Estado
    const formatEstado = (estado: any) => {
      if (!estado) return 'No hay estado';
      const e = String(estado).toLowerCase().trim();
      if (e.includes('inicial')) return 'Inicial';
      if (e.includes('intermedio 1')) return 'Intermedio 1';
      if (e.includes('intermedio 2')) return 'Intermedio 2';
      if (e.includes('intermedio 3')) return 'Intermedio 3';
      if (e.includes('completo')) return 'Completo';
      return String(estado).trim();
    };

    const estadosDescripciones: Record<string, string> = {
      'Inicial': 'Teniendo en cuenta que este procedimiento se encuentra en un estado inicial, se ha identificado que para llegar al estado completo se requiere definir y establecer los soportes documentales, soporte computacional y reglamentar el procedimiento.',
      'Intermedio 1': 'El procedimiento se encuentra en un estado intermedio I1, para llegar a un estado completo se requiere definir el soporte computacional y reglamentar el procedimiento.',
      'Intermedio 2': 'El procedimiento se encuentra en un estado intermedio I2, para llegar a un estado completo se requiere definir y establecer los soportes documentales y la reglamentación del procedimiento.',
      'Intermedio 3': 'El procedimiento se encuentra en un estado intermedio I3, para llegar a un estado completo se requiere definir y establecer la unificación de criterios y definir si se requiere o no un soporte computacional.',
      'Completo': 'El procedimiento se encuentra en un estado completo.'
    };

    const estadoFormateado = formatEstado(procedimiento.estado);
    processedData['descripcion'] = estadosDescripciones[estadoFormateado] || estadoFormateado;

    // 3. Documento (Reglamentos Base)
    let documentosList = '';
    if (documentoSoporte && documentoSoporte.reglamentosBase && documentoSoporte.reglamentosBase.length > 0) {
      documentosList = documentoSoporte.reglamentosBase
        .map((rb: any) => `• ${rb.documento}`)
        .join('\n');
    }
    processedData['documento'] = documentosList;

    // 4. Soporte Computacional
    const querySoporte = await this.dataSource.query(`SELECT * FROM soporte_computacional WHERE procedimiento_id = ?`, [id]);
    const soporte: any = querySoporte[0];
    let soporteStr = '';
    if (soporte) {
      if (soporte.tiene_soporte === 1 || soporte.tiene_soporte === true) {
        soporteStr = `${soporte.descripcion || ''}`;
      } else {
        if (soporte.requiere_soporte === 1 || soporte.requiere_soporte === true) {
          soporteStr = `El ${pNombre} requiere soporte computacional.`;
        } else {
          soporteStr = `El ${pNombre} no cuenta con soporte documental y tampoco requiere.`;
        }
      }
    }
    processedData['soporte_computacional'] = soporteStr;

    // 5. Socialización (Mecanismo)
    const querySocializacion = await this.dataSource.query(`SELECT * FROM socializacion WHERE procedimiento_id = ?`, [id]);
    const socializacion: any = querySocializacion[0];
    if (socializacion && socializacion.mecanismo) {
      processedData['mecanismo'] = socializacion.mecanismo;
    }

    // 2️⃣ Preparar rutas
    const rootPath = path.resolve(process.cwd());
    const tmpPath = path.join(rootPath, 'tmp', 'formato_estandarizacion');
    const jasperPath = path.join(rootPath, 'jasper');
    const dataPath = path.join(tmpPath, `data_std_${id}.json`);
    const pdfPath = path.join(tmpPath, `reporte_std_${id}.pdf`);

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

      const jasperProcess = spawn('java', [
        '-Xmx256m',
        '-Dnet.sf.jasperreports.awt.ignore.missing.font=true',
        '-cp',
        classpath,
        'JasperRenderer',
        'formato_estandarizacion.jasper',
        '.',
        dataPath,
        pdfPath
      ], {
        cwd: path.join(jasperPath, 'formato-estandarizacion'), // Nueva carpeta
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
