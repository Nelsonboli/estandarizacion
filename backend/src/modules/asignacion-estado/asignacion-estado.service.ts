import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAsignacionEstadoDto } from './dto/create-asignacion_estado.dto';
import { UpdateAsignacionEstadoDto } from './dto/update-asignacion_estado.dto';
import { Procedimiento } from '../identificacion-requerimientos/entities/procedimiento.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionEstado } from './entities/asignacion_estado.entity';

@Injectable()
export class AsignacionEstadoService {
  constructor(
    @InjectRepository(Procedimiento)
    private readonly procedimientoRepo: Repository<Procedimiento>,
    @InjectRepository(AsignacionEstado)
    private readonly asignacionEstadoRepo: Repository<AsignacionEstado>,
  ) { }


  async crearPorProcedimiento(procedimientoId: number) {
    const procedimiento = await this.procedimientoRepo.findOne({ where: { id: procedimientoId } });
    if (!procedimiento) throw new HttpException('Procedimiento no encontrado', HttpStatus.NOT_FOUND);

    const asignacionEstado = await this.asignacionEstadoRepo.findOne({ where: { procedimiento: { id: procedimientoId } } });
    if (asignacionEstado) return asignacionEstado;

    const asignacionEstadoDefault = this.asignacionEstadoRepo.create({
      procedimiento,
      estado_procedimiento: 'Inicial',
      criterios_completos: false,
      estado_inicial: procedimiento.estado
    });
    return this.asignacionEstadoRepo.save(asignacionEstadoDefault);
  }

  async findAll() {
    return this.asignacionEstadoRepo.find({
      relations: ['procedimiento']
    })
  }

  async findOne(id: number) {
    const asignacionEstado = await this.asignacionEstadoRepo.findOne({
      where: { id },
      relations: ['procedimiento'],
    });
    if (!asignacionEstado) throw new HttpException('Asignacion de estado no encontrada', HttpStatus.NOT_FOUND)
    return asignacionEstado;
  }

  async findByProcedimiento(procedimientoId: number) {
    const asignacionEstado = await this.asignacionEstadoRepo.findOne({
      where: { procedimiento: { id: procedimientoId } },
      relations: ['procedimiento'],
    });
    // Si no existe, lo creamos para mantener consistencia
    if (!asignacionEstado) {
      return this.crearPorProcedimiento(procedimientoId);
    }
    return asignacionEstado;
  }

  async update(id: number, updateAsignacionEstadoDto: UpdateAsignacionEstadoDto) {
    const asignacionEstadoFound = await this.findOne(id);
    if (!asignacionEstadoFound) throw new HttpException('Asignacion de estado no encontrada', HttpStatus.NOT_FOUND)
    const updateAsignacionEstado = Object.assign(asignacionEstadoFound, updateAsignacionEstadoDto);
    return this.asignacionEstadoRepo.save(updateAsignacionEstado);
  }

  async remove(id: number) {
    const asignacionEstadoFound = await this.findOne(id);
    if (!asignacionEstadoFound) throw new HttpException('Asignacion de estado no encontrada', HttpStatus.NOT_FOUND)
    return this.asignacionEstadoRepo.remove(asignacionEstadoFound);
  }
}
