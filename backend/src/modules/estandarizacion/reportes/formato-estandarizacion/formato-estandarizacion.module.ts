import { Module } from '@nestjs/common';
import { FormatoEstandarizacionService } from './formato-estandarizacion.service';
import { FormatoEstandarizacionController } from './formato-estandarizacion.controller';
import { ProcedimientoModule } from 'src/modules/identificacion-requerimientos/procedimiento.module';
import { FormulariodaacModule } from '../../criterios/documento-soporte/components/formulariodaac/formulariodaac.module';
import { DocumentoSoporteModule } from '../../criterios/documento-soporte/documento-soporte/documento-soporte.module';

@Module({
  imports: [
    ProcedimientoModule,
    DocumentoSoporteModule,
    FormulariodaacModule
  ],
  controllers: [FormatoEstandarizacionController],
  providers: [FormatoEstandarizacionService],
  exports: [FormatoEstandarizacionService],
})
export class FormatoEstandarizacionModule { }
