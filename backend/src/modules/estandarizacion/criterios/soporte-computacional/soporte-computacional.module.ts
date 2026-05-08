import { Module } from '@nestjs/common';
import { SoporteComputacionalService } from './soporte-computacional.service';
import { SoporteComputacionalController } from './soporte-computacional.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoporteComputacional } from './entities/soporte-computacional.entity';
import { Procedimiento } from 'src/modules/identificacion-requerimientos/entities/procedimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SoporteComputacional, Procedimiento])],
  controllers: [SoporteComputacionalController],
  providers: [SoporteComputacionalService],
})
export class SoporteComputacionalModule {

}
