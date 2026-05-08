import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Formulariodaac } from './entities/formulariodaac.entity';
import { CreateFormulariodaacDto } from './dto/create-formulariodaac.dto';
import { UpdateFormulariodaacDto } from './dto/update-formulariodaac.dto';
import { DocumentoSoporte } from 'src/modules/estandarizacion/criterios/documento-soporte/documento-soporte/entities/documento-soporte.entity';

@Injectable()
export class FormulariodaacService {
  constructor(
    @InjectRepository(Formulariodaac)
    private repo: Repository<Formulariodaac>,
    @InjectRepository(DocumentoSoporte)
    private documentoRepo: Repository<DocumentoSoporte>,
  ) { }


  async createConDocumento(dto: CreateFormulariodaacDto) {
    if (!dto.documento_soporte_id) throw new HttpException('documento_soporte_id requerido', HttpStatus.NOT_FOUND);

    const documento = await this.documentoRepo.findOne({ where: { id: dto.documento_soporte_id } });
    if (!documento) throw new HttpException('documento soporte no encontrado', HttpStatus.NOT_FOUND);

    // Verificar que ese documento no tenga ya un formulario (1:1)
    const existente = await this.repo.findOne({ where: { documentoSoporte: { id: dto.documento_soporte_id } } });
    if (existente) throw new HttpException('El documento soporte ya tiene un formulario asociado', HttpStatus.CONFLICT);

    const form = this.repo.create({
      ...dto,
      documentoSoporte: documento,
    });

    return this.repo.save(form);
  }

  async findByDocumento(id: number) {
    return this.repo.findOne({
      where: { documentoSoporte: { id: id } },
      relations: {
        documentoSoporte: true
      }
    });
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const entity = await this.repo.findOne({ where: { id }, relations: ['documentoSoporte'] });
    if (!entity) throw new HttpException('Formulario no encontrado', HttpStatus.NOT_FOUND);
    return entity;
  }

  async update(id: number, dto: UpdateFormulariodaacDto) {
    const entity = await this.repo.preload({ id, ...dto });
    if (!entity) throw new HttpException('Formulario no encontrado', HttpStatus.NOT_FOUND);
    return this.repo.save(entity);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }


}

