import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagramaFlujo } from './entities/diagrama-flujo.entity';
import { DocumentoSoporte } from 'src/modules/estandarizacion/Estados/documento-soporte/documento-soporte/entities/documento-soporte.entity';
import { CreateDiagramaFlujoDto } from './dto/create-diagrama-flujo.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DiagramaFlujoService {
  constructor(
    @InjectRepository(DiagramaFlujo)
    private readonly diagramaRepo: Repository<DiagramaFlujo>,
    @InjectRepository(DocumentoSoporte)
    private readonly documentoRepo: Repository<DocumentoSoporte>,
  ) { }

  async guardarDiagrama(idDoc: number, data: CreateDiagramaFlujoDto) {
    try {
      const doc = await this.documentoRepo.findOne({
        where: { id: idDoc },
        relations: ['procedimiento', 'diagramaFlujo']
      });

      if (!doc) {
        throw new NotFoundException('Documento soporte no encontrado');
      }

      if (!doc.procedimiento) {
        throw new Error('El documento no tiene un procedimiento asociado');
      }

      const procedimientoNombre = (doc.procedimiento.procedimiento?.trim() || 'sin-nombre').replace(/[/\\?%*:|"<>]/g, '-');
      const baseDir = 'C:\\Users\\Udenar\\Desktop\\Estandarizacion de procedimientos\\Diagrama de flujo';

      // Crear carpeta específica del procedimiento
      const procDir = path.join(baseDir, procedimientoNombre);

      if (!fs.existsSync(procDir)) {
        fs.mkdirSync(procDir, { recursive: true });
      }

      // Guardar imágenes individuales si existen
      if (data.imagenes && data.imagenes.length > 0) {
        // 👉 REFUERZO: Limpiar archivos antiguos para que no queden páginas huérfanas en el disco
        if (fs.existsSync(procDir)) {
          const files = fs.readdirSync(procDir);
          for (const file of files) {
            if (file.endsWith('.png')) {
              try {
                fs.unlinkSync(path.join(procDir, file));
              } catch (e) {
                console.warn(`No se pudo eliminar archivo antiguo: ${file}`);
              }
            }
          }
        }

        data.imagenes.forEach((imgBase64, index) => {
          if (!imgBase64) return;
          const cleanBase64 = imgBase64.includes(',') ? imgBase64.split(',')[1] : imgBase64;
          const imgBuffer = Buffer.from(cleanBase64, 'base64');
          const imgPath = path.join(procDir, `pagina_${index + 1}.png`);
          fs.writeFileSync(imgPath, imgBuffer);
        });
      }

      // Guardar PDF principal
      if (!data.pdf_diagrama) {
        throw new Error('No se recibió el PDF del diagrama');
      }

      const cleanBase64Score = data.pdf_diagrama.includes(',') ? data.pdf_diagrama.split(',')[1] : data.pdf_diagrama;
      const pdfBuffer = Buffer.from(cleanBase64Score, 'base64');

      const fileName = data.documento_diagrama || `diagrama_${idDoc}.pdf`;
      const pdfPath = path.join(baseDir, fileName);

      fs.writeFileSync(pdfPath, pdfBuffer);

      // Buscar o crear el diagrama de forma más robusta usando el ID directo
      let diag = await this.diagramaRepo.findOne({
        where: { documento_soporte_id: idDoc }
      });

      if (!diag) {
        diag = this.diagramaRepo.create({
          documento_soporte_id: idDoc
        });
      }

      // Asegurar que el ID se mantenga si ya existía (upsert)
      diag.documento_soporte_id = idDoc;

      // Asegurar que el ID se mantenga si ya existía (upsert)
      diag.documento_soporte_id = idDoc;

      // Actualizar datos
      diag.documento_diagrama = fileName;
      diag.ubicacion_diagrama = pdfPath;
      diag.json_diagrama = data.json_diagrama;

      // Guardar el diagrama primero
      diag = await this.diagramaRepo.save(diag);

      // Vincularlo al documento en memoria para que syncCompletion lo vea
      doc.diagramaFlujo = diag;

      // Actualizar completion en DocumentoSoporte
      if (!doc.actividades_completadas) {
        doc.actividades_completadas = {
          reglamentoBase: false,
          formulario: false,
          diagramaFlujo: false,
        };
      }
      doc.actividades_completadas.diagramaFlujo = true;
      await this.syncCompletion(doc);

      return diag;
    } catch (error) {
      console.error('❌ Error en guardarDiagrama:', error);
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al guardar el diagrama: ' + error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDiagramaPdf(idDoc: number) {
    const diag = await this.diagramaRepo.findOne({
      where: { documento_soporte_id: idDoc }
    });

    if (!diag || !diag.ubicacion_diagrama) {
      throw new NotFoundException('Diagrama de flujo no encontrado');
    }

    const filePath = diag.ubicacion_diagrama;
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('El archivo físico del diagrama no existe');
    }

    const pdfBuffer = fs.readFileSync(filePath);
    return {
      pdfBase64: pdfBuffer.toString('base64'),
      nombreArchivo: diag.documento_diagrama
    };
  }

  async obtenerPorDocumento(idDoc: number) {
    return this.diagramaRepo.findOne({
      where: { documento_soporte_id: idDoc }
    });
  }

  async eliminarDiagrama(idDoc: number) {
    try {
      const doc = await this.documentoRepo.findOne({
        where: { id: idDoc },
        relations: ['procedimiento', 'diagramaFlujo']
      });

      if (!doc || !doc.diagramaFlujo) {
        throw new NotFoundException('Diagrama de flujo no encontrado');
      }

      const diag = doc.diagramaFlujo;
      const baseDir = 'C:\\Users\\Udenar\\Desktop\\Estandarizacion de procedimientos\\Diagrama de flujo';

      // 1. Eliminar PDF
      if (diag.ubicacion_diagrama && fs.existsSync(diag.ubicacion_diagrama)) {
        try {
          fs.unlinkSync(diag.ubicacion_diagrama);
        } catch (e) {
          console.warn(`No se pudo eliminar el archivo PDF físico: ${diag.ubicacion_diagrama}`);
        }
      }

      // 2. Eliminar carpeta de imágenes
      if (doc.procedimiento) {
        const procedimientoNombre = (doc.procedimiento.procedimiento || 'sin-nombre').replace(/[/\\?%*:|"<>]/g, '-');
        const procDir = path.join(baseDir, procedimientoNombre);
        if (fs.existsSync(procDir)) {
          try {
            fs.rmSync(procDir, { recursive: true, force: true });
          } catch (e) {
            console.warn(`No se pudo eliminar la carpeta de imágenes: ${procDir}`);
          }
        }
      }

      // 3. Limpiar DB
      await this.diagramaRepo.remove(diag);

      if (doc.actividades_completadas) {
        doc.actividades_completadas.diagramaFlujo = false;
      }

      await this.syncCompletion(doc);
      return { message: 'Diagrama eliminado' };
    } catch (error) {
      console.error('❌ Error en eliminarDiagrama:', error);
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al eliminar el diagrama: ' + error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async syncCompletion(doc: DocumentoSoporte) {
    if (doc.actividades_completadas) {
      doc.documento_completado =
        doc.actividades_completadas.reglamentoBase === true &&
        doc.actividades_completadas.formulario === true &&
        doc.actividades_completadas.diagramaFlujo === true;
    }
    return this.documentoRepo.save(doc);
  }
}
