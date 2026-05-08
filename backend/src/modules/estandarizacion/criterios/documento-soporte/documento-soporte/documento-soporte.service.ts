import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentoSoporte } from './entities/documento-soporte.entity';
import { UpdateDocumentoSoporteDto } from './dto/update-documento-soporte.dto';
import { Procedimiento } from 'src/modules/identificacion-requerimientos/entities/procedimiento.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentoSoporteService {
  constructor(
    @InjectRepository(DocumentoSoporte)
    private readonly documentoRepo: Repository<DocumentoSoporte>,
    @InjectRepository(Procedimiento)
    private readonly procedimientoRepo: Repository<Procedimiento>,
  ) { }

  async crearDocumentoSoporte(id: number) {
    const procedimiento = await this.procedimientoRepo.findOne({ where: { id } });
    if (!procedimiento) throw new HttpException('Procedimiento no encontrado', HttpStatus.NOT_FOUND);
    // Busca si existe un documento de soporte 
    const existente = await this.documentoRepo.findOne({
      where: { procedimiento: { id } },
    });
    if (existente) return existente;
    //Crea un documento de soporte por defecto si no existe
    const DocumentoSoporteDefault = this.documentoRepo.create({
      procedimiento,
      documento_completado: false,
      actividades_completadas: {
        reglamentoBase: false,
        formulario: false,
        diagramaFlujo: false,
      },
    });
    return this.documentoRepo.save(DocumentoSoporteDefault);
  }

  // Obtiene el documento de soporte por procedimiento
  async getPorProcedimiento(id: number) {
    const doc = await this.documentoRepo.findOne({
      where: { procedimiento: { id } },
      relations: ['procedimiento', 'diagramaFlujo', 'formulariodaac', 'reglamentosBase'],
    });
    // Retornar null si no existe, en lugar de lanzar excepción
    // Esto permite que el frontend maneje la creación del documento
    return doc || null;
  }

  findAll() {
    return this.documentoRepo.find({
      relations: ['procedimiento'],
    });
  }

  async findOne(id: number) {
    const doc = await this.documentoRepo.findOne({
      where: { id: id },
      relations: ['procedimiento', 'formulariodaac', 'reglamentosBase', 'diagramaFlujo'],
    });
    if (!doc) throw new HttpException('Documento de soporte no encontrado', HttpStatus.NOT_FOUND)
    return doc;
  }

  async update(id: number, docSoporte: UpdateDocumentoSoporteDto) {
    const docFound = await this.findOne(id);
    console.log("el documento actualizado es:", docFound);
    if (!docFound) throw new HttpException('Documento desoporte no encontrado', HttpStatus.NOT_FOUND)
    const updateDocSoporte = Object.assign(docFound, docSoporte);
    return this.documentoRepo.save(updateDocSoporte);
  }

  async remove(id: number) {
    const docSoporte = await this.findOne(id);
    if (!docSoporte) throw new HttpException('Docmuento de soporte no encontrado', HttpStatus.NOT_FOUND)
    return this.documentoRepo.remove(docSoporte);
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
