import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagramaFlujo } from './entities/diagrama-flujo.entity';
import { DocumentoSoporte } from 'src/modules/estandarizacion/criterios/documento-soporte/documento-soporte/entities/documento-soporte.entity';
import { CreateDiagramaFlujoDto } from './dto/create-diagrama-flujo.dto';
import { StorageService } from 'src/modules/storage/storage.service';

@Injectable()
export class DiagramaFlujoService {
  constructor(
    @InjectRepository(DiagramaFlujo)
    private readonly diagramaRepo: Repository<DiagramaFlujo>,
    @InjectRepository(DocumentoSoporte)
    private readonly documentoRepo: Repository<DocumentoSoporte>,
    private readonly storageService: StorageService,
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

      // Guardar imágenes individuales en Supabase Storage
      if (data.imagenes && data.imagenes.length > 0) {
        for (let i = 0; i < data.imagenes.length; i++) {
          const imgBase64 = data.imagenes[i];
          if (!imgBase64) continue;
          
          const cleanBase64 = imgBase64.includes(',') ? imgBase64.split(',')[1] : imgBase64;
          const imgBuffer = Buffer.from(cleanBase64, 'base64');
          
          const storagePath = `procedimiento_${idDoc}/pagina_${i + 1}.png`;
          await this.storageService.subirArchivo('diagramas', storagePath, imgBuffer, 'image/png');
        }
      }

      // Guardar PDF principal en Supabase Storage
      if (!data.pdf_diagrama) {
        throw new Error('No se recibió el PDF del diagrama');
      }

      const cleanBase64Score = data.pdf_diagrama.includes(',') ? data.pdf_diagrama.split(',')[1] : data.pdf_diagrama;
      const pdfBuffer = Buffer.from(cleanBase64Score, 'base64');

      const fileName = data.documento_diagrama || `diagrama_${idDoc}.pdf`;
      const storagePath = `procedimiento_${idDoc}/diagrama_${idDoc}.pdf`;
      
      const publicUrl = await this.storageService.subirArchivo('diagramas', storagePath, pdfBuffer, 'application/pdf');

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

      // Actualizar datos
      diag.documento_diagrama = fileName;
      diag.ubicacion_diagrama = publicUrl; // Ahora guarda la URL pública de Supabase
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

    const storagePath = `procedimiento_${idDoc}/diagrama_${idDoc}.pdf`;
    try {
      const pdfBuffer = await this.storageService.descargarArchivo('diagramas', storagePath);
      return {
        pdfBase64: pdfBuffer.toString('base64'),
        nombreArchivo: diag.documento_diagrama
      };
    } catch (e) {
      throw new NotFoundException('El archivo del diagrama no existe en Supabase Storage: ' + e.message);
    }
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
      const baseStoragePath = `procedimiento_${idDoc}`;

      // 1. Eliminar PDF en Supabase
      try {
        await this.storageService.eliminarArchivo('diagramas', `${baseStoragePath}/diagrama_${idDoc}.pdf`);
      } catch (e) {
        console.warn(`No se pudo eliminar el PDF de Supabase: ${e.message}`);
      }

      // 2. Eliminar carpeta de imágenes en Supabase (páginas individuales)
      // Como Supabase es almacenamiento de objetos flat, eliminamos secuencialmente las páginas que existan (hasta 20 páginas)
      for (let i = 1; i <= 20; i++) {
        try {
          await this.storageService.eliminarArchivo('diagramas', `${baseStoragePath}/pagina_${i}.png`);
        } catch (e) {
          // Dejar de iterar si falla o no existe
          break;
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
