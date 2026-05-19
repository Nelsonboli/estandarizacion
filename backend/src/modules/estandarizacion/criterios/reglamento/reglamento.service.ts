import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateReglamentoDto } from './dto/update-reglamento.dto';
import { Reglamento } from './entities/reglamento.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Procedimiento } from 'src/modules/identificacion-requerimientos/entities/procedimiento.entity';
import { StorageService } from 'src/modules/storage/storage.service';

@Injectable()
export class ReglamentoService {
  constructor(
    @InjectRepository(Reglamento)
    private readonly reglamentoRepository: Repository<Reglamento>,
    @InjectRepository(Procedimiento)
    private readonly procedimientoRepository: Repository<Procedimiento>,
    private readonly storageService: StorageService,
  ) { }

  async createReglamentoPorProcedimiento(procedimiento_id: number) {
    const procedimiento = await this.procedimientoRepository.findOne({ where: { id: procedimiento_id } });
    if (!procedimiento) throw new HttpException('Procedimiento no encontrado', HttpStatus.NOT_FOUND);

    const existente = await this.reglamentoRepository.findOne({
      where: { procedimiento: { id: procedimiento_id } }
    });
    if (existente) return existente;

    const nuevo = await this.reglamentoRepository.create({
      procedimiento,
      reglamento_completado: false,
      actividades_completadas: {
        descarga_daac_completada: false,
        subida_daac_completada: false,
      },
    });
    return this.reglamentoRepository.save(nuevo);
  }

  async findAll() {
    return this.reglamentoRepository.find();
  }

  async findOne(id: number) {
    return this.reglamentoRepository.findOne({ where: { id } })
  }

  async getPorProcedimiento(procedimientoId: number) {
    const inf = await this.reglamentoRepository.findOne({
      where: { procedimiento: { id: procedimientoId } },
    });
    return inf || null;
  }

  async update(id: number, updateReglamentoDto: UpdateReglamentoDto) {
    const reglamento = await this.reglamentoRepository.findOne({ where: { id } });
    if (!reglamento) throw new HttpException('Reglamento no encontrado', HttpStatus.NOT_FOUND);

    const updateReglamento = Object.assign(reglamento, updateReglamentoDto);
    return this.reglamentoRepository.save(updateReglamento);
  }

  async remove(id: number) {
    const reglamento = await this.reglamentoRepository.findOne({ where: { id } });
    if (!reglamento) throw new HttpException('Reglamento no encontrado', HttpStatus.NOT_FOUND);

    if (reglamento.formato_daac_subido) {
      try {
        const parts = reglamento.formato_daac_subido.split('reglamentos/');
        if (parts.length > 1) {
          await this.storageService.eliminarArchivo('reglamentos', parts[1]);
        }
      } catch (error) {
        console.error('Error al eliminar archivo durante remoción de reglamento:', error);
      }
    }

    return this.reglamentoRepository.remove(reglamento);
  }

  async subirFormatoDAAC(id: number, file: Express.Multer.File) {
    const reglamento = await this.reglamentoRepository.findOne({ where: { id } });
    if (!reglamento) throw new HttpException('Reglamento no encontrado', HttpStatus.NOT_FOUND);

    const bucketName = 'reglamentos';
    const storagePath = `reglamento_${id}/${Date.now()}-${file.originalname}`;

    // Subir el archivo directo a Supabase
    const publicUrl = await this.storageService.subirArchivo(bucketName, storagePath, file.buffer, file.mimetype);

    // Eliminar archivo anterior si existe
    if (reglamento.formato_daac_subido) {
      try {
        const parts = reglamento.formato_daac_subido.split('reglamentos/');
        if (parts.length > 1) {
          await this.storageService.eliminarArchivo('reglamentos', parts[1]);
        }
      } catch (error) {
        console.error('Error al eliminar archivo anterior:', error);
      }
    }

    reglamento.formato_daac_subido = publicUrl;
    const currentActividades = reglamento.actividades_completadas || {
      descarga_daac_completada: false,
      subida_daac_completada: false,
    };

    reglamento.actividades_completadas = {
      ...currentActividades,
      subida_daac_completada: true
    };

    reglamento.reglamento_completado =
      reglamento.actividades_completadas.descarga_daac_completada &&
      reglamento.actividades_completadas.subida_daac_completada;

    return this.reglamentoRepository.save(reglamento);
  }

  async eliminarFormatoDAAC(id: number) {
    const reglamento = await this.reglamentoRepository.findOne({ where: { id } });
    if (!reglamento) throw new HttpException('Reglamento no encontrado', HttpStatus.NOT_FOUND);

    if (reglamento.formato_daac_subido) {
      try {
        const parts = reglamento.formato_daac_subido.split('reglamentos/');
        if (parts.length > 1) {
          await this.storageService.eliminarArchivo('reglamentos', parts[1]);
        }
      } catch (error) {
        console.error('Error al eliminar archivo:', error);
      }
    }

    reglamento.formato_daac_subido = null;

    const currentActividades = reglamento.actividades_completadas || {
      descarga_daac_completada: false,
      subida_daac_completada: false,
    };

    reglamento.actividades_completadas = {
      ...currentActividades,
      subida_daac_completada: false
    };

    reglamento.reglamento_completado = false;

    return this.reglamentoRepository.save(reglamento);
  }

  async marcarComoDescargado(id: number, fileName: string) {
    const reglamento = await this.reglamentoRepository.findOne({ where: { id } });
    if (!reglamento) throw new HttpException('Reglamento no encontrado', HttpStatus.NOT_FOUND);

    reglamento.formato_daac_descargado = fileName;

    const currentActividades = reglamento.actividades_completadas || {
      descarga_daac_completada: false,
      subida_daac_completada: false,
    };

    reglamento.actividades_completadas = {
      ...currentActividades,
      descarga_daac_completada: true
    };

    reglamento.reglamento_completado =
      (reglamento.actividades_completadas.descarga_daac_completada &&
        reglamento.actividades_completadas.subida_daac_completada) || false;

    return this.reglamentoRepository.save(reglamento);
  }
}
