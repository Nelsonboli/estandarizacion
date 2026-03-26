import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Procedimiento } from './entities/procedimiento.entity';
import { CreateProcedimientoDto } from './dto/create-procedimiento.dto';
import { UpdateProcedimientoDto } from './dto/update-procedimiento.dto';

@Injectable()
export class ProcedimientoService {
  constructor(
    @InjectRepository(Procedimiento)
    private readonly procedimientoRepository: Repository<Procedimiento>,
  ) { }

  async create(data: CreateProcedimientoDto) {
    const nuevo = await this.procedimientoRepository.create(data);
    return this.procedimientoRepository.save(nuevo);
  }

  async findAll() {
    const procedimientoFound = await this.procedimientoRepository.find();
    if (!procedimientoFound) throw new HttpException('Procedimiento no encontrado', HttpStatus.NOT_FOUND)
    return procedimientoFound;
  }

  async findOne(id: number) {
    const procedimientoFound = await this.procedimientoRepository.findOneBy({ id });
    if (!procedimientoFound) throw new HttpException('Procedimiento no encontrado', HttpStatus.NOT_FOUND)
    return procedimientoFound;
  }

  async update(id: number, data: UpdateProcedimientoDto) {
    const procedimientoFound = await this.findOne(id);
    if (!procedimientoFound) throw new HttpException('Procedimiento no encontrado', HttpStatus.NOT_FOUND)
    await this.procedimientoRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const procedimientoFound = await this.findOne(id);
    if (!procedimientoFound) throw new HttpException('Procedimiento no encontrado', HttpStatus.NOT_FOUND)
    return this.procedimientoRepository.delete(id);
  }

  async buscar(termino: string) {
    if (!termino || termino.trim() === '') {
      // Si no hay término, devuelve todos
      return this.procedimientoRepository.find();
    }

    // Busca en varios campos con LIKE (sin distinción de mayúsculas)
    return this.procedimientoRepository.find({
      where: [
        { procedimiento: ILike(`%${termino}%`) },
        { roles: ILike(`%${termino}%`) },
        { actividades: ILike(`%${termino}%`) },
        { estado: ILike(`%${termino}%`) },
        { referencias: ILike(`%${termino}%`) },
        { categoria: ILike(`%${termino}%`) },
      ],
    });
  }

}
