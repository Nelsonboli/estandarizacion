import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateSoporteComputacionalDto } from './dto/update-soporte-computacional.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SoporteComputacional } from './entities/soporte-computacional.entity';
import { Repository } from 'typeorm';
import { Procedimiento } from 'src/modules/identificacion-requerimientos/entities/procedimiento.entity';

@Injectable()
export class SoporteComputacionalService {

  constructor(
    @InjectRepository(SoporteComputacional)
    private readonly soporteComputacionalRepository: Repository<SoporteComputacional>,
    @InjectRepository(Procedimiento)
    private readonly procedimientoRepository: Repository<Procedimiento>,
  ) { }

  async crearSoporteComputacionalPorProcedimiento(procedimientoId: number) {
    const procedimiento = await this.procedimientoRepository.findOne({ where: { id: procedimientoId } });
    if (!procedimiento) throw new HttpException('Procedimiento no encontrado', HttpStatus.NOT_FOUND);

    const existente = await this.soporteComputacionalRepository.findOne({
      where: { procedimiento: { id: procedimientoId } }
    });
    if (existente) return existente;

    const nuevo = this.soporteComputacionalRepository.create();
    nuevo.procedimiento = procedimiento;
    nuevo.procedimiento_id = procedimientoId;
    nuevo.tiene_soporte = null;
    nuevo.nombre = null;
    nuevo.descripcion = null;
    nuevo.requiere_soporte = null;
    nuevo.computacional_completado = false;

    return this.soporteComputacionalRepository.save(nuevo);
  }

  findAll() {
    return this.soporteComputacionalRepository.find();
  }

  findOne(id: number) {
    return this.soporteComputacionalRepository.findOne({ where: { id } })

  }

  async getPorProcedimiento(procedimientoId: number) {
    const inf = await this.soporteComputacionalRepository.findOne({
      where: { procedimiento: { id: procedimientoId } },
    });
    // Retornar null si no existe, en lugar de lanzar excepción
    // Esto permite que el frontend maneje la creación del soporte
    return inf || null;
  }

  async update(id: number, updateSoporteComputacionalDto: UpdateSoporteComputacionalDto) {
    const soporte = await this.soporteComputacionalRepository.findOne({ where: { id } });
    if (!soporte) throw new HttpException('Soporte computacional no encontrado', HttpStatus.NOT_FOUND);

    Object.assign(soporte, updateSoporteComputacionalDto);
    return this.soporteComputacionalRepository.save(soporte);
  }

  async remove(id: number) {
    const soporte = await this.soporteComputacionalRepository.findOne({ where: { id } });
    if (!soporte) throw new HttpException('Soporte computacional no encontrado', HttpStatus.NOT_FOUND);

    await this.soporteComputacionalRepository.remove(soporte);
    return { message: 'Soporte computacional eliminado correctamente' };
  }
}
