import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSocializacionDto } from './dto/create-socializacion.dto';
import { UpdateSocializacionDto } from './dto/update-socializacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Socializacion } from './entities/socializacion.entity';
import { Repository } from 'typeorm';
import { Procedimiento } from '../identificacion-requerimientos/entities/procedimiento.entity';
import { Reglamento } from '../estandarizacion/criterios/reglamento/entities/reglamento.entity';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs-extra';
import { ReportService } from '../estandarizacion/reportes/reporte-DAAC/reports.service';
import { FormatoEstandarizacionService } from '../estandarizacion/reportes/formato-estandarizacion/formato-estandarizacion.service';

@Injectable()
export class SocializacionService {
  constructor(
    @InjectRepository(Socializacion)
    private socializacionRepository: Repository<Socializacion>,
    @InjectRepository(Procedimiento)
    private procedimientoRepository: Repository<Procedimiento>,
    @InjectRepository(Reglamento)
    private reglamentoRepository: Repository<Reglamento>,
    private formatoEstandarizacionService: FormatoEstandarizacionService
  ) { }

  async unirPdfsPorProcedimiento(procedimientoId: number): Promise<Buffer> {
    const reglamento = await this.reglamentoRepository.findOne({
      where: { procedimiento: { id: procedimientoId } }
    });
    if (!reglamento) {
      throw new HttpException('No se encontro reglamento para el procedimiento', HttpStatus.NOT_FOUND);
    }
    const { formato_daac_subido } = reglamento;

    if (!formato_daac_subido) {
      throw new HttpException('Falta el formato DAAC firmado para realizar la union', HttpStatus.BAD_REQUEST);
    }

    try {
      if (!await fs.pathExists(formato_daac_subido)) {
        throw new HttpException('No se encontro el archivo DAAC firmado en almacenamiento', HttpStatus.NOT_FOUND);
      }

      const rutaReporteEstandarizacion = await this.formatoEstandarizacionService.generarReporteEstandarizacion(procedimientoId);
      if (!await fs.pathExists(rutaReporteEstandarizacion)) {
        throw new HttpException('No se pudo generar el reporte de estandarizacion', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const [pdfEstandarizacionBytes, pdfDaacBytes] = await Promise.all([
        fs.readFile(rutaReporteEstandarizacion),
        fs.readFile(formato_daac_subido)
      ]);

      return this.unirpdfs(pdfEstandarizacionBytes, pdfDaacBytes);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Error al preparar archivos PDF: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async unirpdfs(pdfEstandarizacionBytes: Buffer, pdfDaacBytes: Buffer): Promise<Buffer> {
    try {
      const pdfDocDaac = await PDFDocument.load(pdfDaacBytes);
      const pdfDocEstandarizacion = await PDFDocument.load(pdfEstandarizacionBytes);

      const pdfFinal = await PDFDocument.create();

      const paginasEstandarizacion = await pdfFinal.copyPages(pdfDocEstandarizacion, pdfDocEstandarizacion.getPageIndices());
      paginasEstandarizacion.forEach(p => pdfFinal.addPage(p));

      const paginasDaac = await pdfFinal.copyPages(pdfDocDaac, pdfDocDaac.getPageIndices());
      paginasDaac.forEach(p => pdfFinal.addPage(p));

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
