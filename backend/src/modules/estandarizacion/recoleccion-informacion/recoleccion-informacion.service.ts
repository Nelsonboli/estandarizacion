import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateRecoleccionInformacionDto } from './dto/update-recoleccion-informacion.dto';
import { RecoleccionInformacion } from './entities/recoleccion-informacion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Procedimiento } from 'src/modules/identificacion-requerimientos/entities/procedimiento.entity';

@Injectable()
export class RecoleccionInformacionService {
  constructor(
    @InjectRepository(RecoleccionInformacion)
    private readonly recoleccionInformacionRepository: Repository<RecoleccionInformacion>,

    @InjectRepository(Procedimiento)
    private readonly procedimientoRepository: Repository<Procedimiento>,
  ) { }

  async crearPorProcedimiento(procedimientoId: number) {
    const existente = await this.recoleccionInformacionRepository.findOne({ where: { procedimiento_id: procedimientoId } });
    if (existente) return existente;
    const procedimiento = await this.procedimientoRepository.findOne({ where: { id: procedimientoId } });
    if (!procedimiento) throw new HttpException('Procedimiento no encontrado', HttpStatus.NOT_FOUND);

    const nuevo = this.recoleccionInformacionRepository.create();
    nuevo.procedimiento = procedimiento;
    nuevo.procedimiento_id = procedimientoId;
    nuevo.encuesta = '';
    return this.recoleccionInformacionRepository.save(nuevo);
  }

  obtenerPorProcedimiento(procedimientoId: number) {

    return this.recoleccionInformacionRepository.findOne({
      where: { procedimiento_id: procedimientoId },
    });
  }

  findAll() {
    return this.recoleccionInformacionRepository.find();
  }

  findOne(id: number) {
    return this.recoleccionInformacionRepository.findOne({ where: { id }, })

  }

  async actualizarRecoleccionInformacion(id: number, updateRecoleccionInformacionDto: UpdateRecoleccionInformacionDto) {
    const info = await this.recoleccionInformacionRepository.findOne({ where: { id } });
    if (!info) throw new HttpException('Informacion no encontrada', HttpStatus.NOT_FOUND);

    return this.recoleccionInformacionRepository.update(id, updateRecoleccionInformacionDto);
  }

  async eliminarRecoleccionInformacion(id: number) {
    const info = await this.recoleccionInformacionRepository.findOne({ where: { id } });
    if (!info) throw new HttpException('Informacion no encontrada', HttpStatus.NOT_FOUND);


    await this.recoleccionInformacionRepository.remove(info);
    return { message: 'Informacion eliminada correctamente' };
  }

}
