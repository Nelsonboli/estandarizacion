import { Module } from '@nestjs/common';
import { SocializacionService } from './socializacion.service';
import { SocializacionController } from './socializacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Socializacion } from './entities/socializacion.entity';
import { Reglamento } from '../estandarizacion/Estados/reglamento/entities/reglamento.entity';
import { Procedimiento } from '../identificacion-requerimientos/entities/procedimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Socializacion, Procedimiento, Reglamento])],
  controllers: [SocializacionController],
  providers: [SocializacionService],
  exports: [TypeOrmModule, SocializacionService],
})
export class SocializacionModule { }
