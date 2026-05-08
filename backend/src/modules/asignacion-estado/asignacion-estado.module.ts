import { Module } from '@nestjs/common';
import { AsignacionEstadoService } from './asignacion-estado.service';
import { AsignacionEstadoController } from './asignacion-estado.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionEstado } from './entities/asignacion_estado.entity';
import { Procedimiento } from '../identificacion-requerimientos/entities/procedimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AsignacionEstado, Procedimiento])],
  controllers: [AsignacionEstadoController],
  providers: [AsignacionEstadoService],
})
export class AsignacionEstadoModule { }
