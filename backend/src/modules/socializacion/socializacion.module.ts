import { Module } from '@nestjs/common';
import { SocializacionService } from './socializacion.service';
import { SocializacionController } from './socializacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Socializacion } from './entities/socializacion.entity';
import { Reglamento } from '../estandarizacion/criterios/reglamento/entities/reglamento.entity';
import { Procedimiento } from '../identificacion-requerimientos/entities/procedimiento.entity';
import { ReportsModule } from '../estandarizacion/reportes/reporte-DAAC/reports.module';
import { FormatoEstandarizacionModule } from '../estandarizacion/reportes/formato-estandarizacion/formato-estandarizacion.module';

@Module({
  imports: [TypeOrmModule.forFeature([Socializacion, Procedimiento, Reglamento]), ReportsModule, FormatoEstandarizacionModule],
  controllers: [SocializacionController],
  providers: [SocializacionService],
  exports: [TypeOrmModule, SocializacionService],
})
export class SocializacionModule { }
