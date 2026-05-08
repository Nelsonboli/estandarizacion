import { Module } from '@nestjs/common';
import { RecoleccionInformacionService } from './recoleccion-informacion.service';
import { RecoleccionInformacionController } from './recoleccion-informacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecoleccionInformacion } from './entities/recoleccion-informacion.entity';
import { Procedimiento } from 'src/modules/identificacion-requerimientos/entities/procedimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecoleccionInformacion, Procedimiento])],
  controllers: [RecoleccionInformacionController],
  providers: [RecoleccionInformacionService],
})
export class RecoleccionInformacionModule { }
