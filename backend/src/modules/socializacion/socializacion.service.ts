import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSocializacionDto } from './dto/create-socializacion.dto';
import { UpdateSocializacionDto } from './dto/update-socializacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Socializacion } from './entities/socializacion.entity';
import { Repository } from 'typeorm';
import { Procedimiento } from '../identificacion-requerimientos/entities/procedimiento.entity';
import { Reglamento } from '../estandarizacion/Estados/reglamento/entities/reglamento.entity';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs-extra';


@Injectable()
export class SocializacionService {
  constructor(
    @InjectRepository(Socializacion)
    private socializacionRepository: Repository<Socializacion>,
    @InjectRepository(Procedimiento)
    private procedimientoRepository: Repository<Procedimiento>,
    @InjectRepository(Reglamento)
    private reglamentoRepository: Repository<Reglamento>
  ) { }

  async unirPdfsPorProcedimiento(procedimientoId: number): Promise<Buffer> {
    const reglamento = await this.reglamentoRepository.findOne({
      where: { procedimiento: { id: procedimientoId } }
    });
    if (!reglamento) {
      throw new HttpException('No se encontró reglamento para el procedimiento', HttpStatus.NOT_FOUND);
    }
    const { formato_daac_subido, formato_estandarizacion_subido } = reglamento;

    if (!formato_daac_subido || !formato_estandarizacion_subido) {
      throw new HttpException('Faltan documentos en el reglamento para realizar la unión', HttpStatus.BAD_REQUEST);
    }
    return await this.unirpdfs(formato_daac_subido, formato_estandarizacion_subido);
  }

  async unirpdfs(ruta2: string, ruta1: string): Promise<Buffer> {
    try {
      if (!await fs.pathExists(ruta1) || !await fs.pathExists(ruta2)) {
        throw new Error('Uno o ambos archivos no existen en la ruta especificada');
      }

      const pdf1Bytes = await fs.readFile(ruta1);
      const pdf2bytes = await fs.readFile(ruta2);

      const pdfDoc1 = await PDFDocument.load(pdf1Bytes);
      const pdfDoc2 = await PDFDocument.load(pdf2bytes);

      const pdfFinal = await PDFDocument.create();

      const paginas1 = await pdfFinal.copyPages(pdfDoc1, pdfDoc1.getPageIndices());
      paginas1.forEach(p => pdfFinal.addPage(p));

      const paginas2 = await pdfFinal.copyPages(pdfDoc2, pdfDoc2.getPageIndices());
      paginas2.forEach(p => pdfFinal.addPage(p));

      const pdfBytes = await pdfFinal.save();

      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('Error al unir PDFs:', error);
      throw new HttpException(`Error al procesar archivos PDF: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createSocializacion(createSocializacionDto: CreateSocializacionDto) {
    const procedimiento = await this.procedimientoRepository.findOne({ where: { id: createSocializacionDto.procedimiento_id } });
    if (!procedimiento) throw new HttpException('procedimiento no encontrado', HttpStatus.NOT_FOUND);

    // Si hora es un objeto Date (gracias a @Type), lo formateamos a string HH:mm:ss
    const horaStr = createSocializacionDto.hora instanceof Date
      ? createSocializacionDto.hora.toTimeString().split(' ')[0]
      : createSocializacionDto.hora;

    const socializacion = this.socializacionRepository.create({
      ...createSocializacionDto,
      hora: horaStr,
      procedimiento: procedimiento
    });
    return this.socializacionRepository.save(socializacion);
  }

  findAll() {
    return this.socializacionRepository.find();
  }

  async findOne(id: number) {
    const socializacion = await this.socializacionRepository.findOne({ where: { id } });
    if (!socializacion) throw new HttpException('Socializacion no encontrada', HttpStatus.NOT_FOUND);
    return socializacion;
  }

  async findByProcedimiento(procedimientoId: number) {
    const socializacion = await this.socializacionRepository.findOne({
      where: { procedimiento: { id: procedimientoId } }
    });
    return socializacion;
  }

  async update(id: number, updateSocializacionDto: UpdateSocializacionDto) {
    const socializacion = await this.socializacionRepository.findOne({ where: { id } });
    if (!socializacion) throw new HttpException('Socializacion no encontrada', HttpStatus.NOT_FOUND);
    Object.assign(socializacion, updateSocializacionDto);
    return this.socializacionRepository.save(socializacion);
  }

  async remove(id: number) {
    const socializacion = await this.socializacionRepository.findOne({ where: { id } });
    if (!socializacion) throw new HttpException('Socializacion no encontrada', HttpStatus.NOT_FOUND);
    return this.socializacionRepository.delete(id);
  }
}
