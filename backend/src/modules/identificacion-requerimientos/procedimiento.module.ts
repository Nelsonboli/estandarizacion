import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Procedimiento } from './entities/procedimiento.entity';
import { ProcedimientoService } from './procedimiento.service';
import { ProcedimientoController } from './procedimiento.controller';
import { SoporteComputacional } from 'src/modules/estandarizacion/Estados/soporte-computacional/entities/soporte-computacional.entity';
import { DocumentoSoporte } from 'src/modules/estandarizacion/Estados/documento-soporte/documento-soporte/entities/documento-soporte.entity';
import { Reglamento } from '../estandarizacion/Estados/reglamento/entities/reglamento.entity';
import { Socializacion } from 'src/modules/socializacion/entities/socializacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Procedimiento, SoporteComputacional, Reglamento, DocumentoSoporte, Socializacion])],
  controllers: [ProcedimientoController],
  providers: [ProcedimientoService],
  exports: [ProcedimientoService],
})
export class ProcedimientoModule { }
