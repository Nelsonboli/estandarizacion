import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateReglamentoBaseDto } from './dto/create-reglamento-base.dto';
import { UpdateReglamentoBaseDto } from './dto/update-reglamento-base.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ReglamentoBase } from './entities/reglamento-base.entity';
import { Repository } from 'typeorm';
import { DocumentoSoporte } from 'src/modules/estandarizacion/criterios/documento-soporte/documento-soporte/entities/documento-soporte.entity';

@Injectable()
export class ReglamentoBaseService {
  constructor(
    @InjectRepository(ReglamentoBase)
    private reglamentoBaseRepository: Repository<ReglamentoBase>,
    @InjectRepository(DocumentoSoporte)
    private documentoSoporteRepository: Repository<DocumentoSoporte>,
  ) { }

  async createByDocumentoSoporte(reglamentoBaseDto: CreateReglamentoBaseDto) {
    const documentoSoporte = await this.documentoSoporteRepository.findOne({ where: { id: reglamentoBaseDto.documento_soporte_id } });
    if (!documentoSoporte) throw new HttpException("Documento soporte no encontrado", HttpStatus.NOT_FOUND);
    const nuevoReglamentoBase = this.reglamentoBaseRepository.create({
      ...reglamentoBaseDto,
      documentoSoporte: documentoSoporte,
    });
    return this.reglamentoBaseRepository.save(nuevoReglamentoBase);
  }

  async findByDocumentoSoporte(documentoSoporteId: number) {
    return this.reglamentoBaseRepository.find({
      where: { documentoSoporte: { id: documentoSoporteId } },
      relations: {
        documentoSoporte: true
      }
    });
  }

  findAll() {
    return this.reglamentoBaseRepository.find({ relations: ['documentoSoporte'] });
  }

  findOne(id: number) {
    return this.reglamentoBaseRepository.findOne({ where: { id }, relations: ['documentoSoporte'] });
  }

  async update(id: number, dto: UpdateReglamentoBaseDto) {
    const existente = await this.reglamentoBaseRepository.findOne({ where: { id } });
    if (!existente) throw new HttpException("ReglamentoBase no encontrado", HttpStatus.NOT_FOUND);
    Object.assign(existente, {
      documento: dto.documento ?? existente.documento,
      documentoSoporte: dto.documento_soporte_id
        ? { id: dto.documento_soporte_id }
        : existente.documentoSoporte,
    });

    console.log("🛠 Datos para actualizar:", existente);

    return await this.reglamentoBaseRepository.save(existente);
  }

  remove(id: number) {
    return this.reglamentoBaseRepository.delete(id);
  }

}

