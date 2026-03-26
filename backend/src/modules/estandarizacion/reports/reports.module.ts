import { Module } from '@nestjs/common';
import { ReportController } from './reports.controller';
import { ReportService } from './reports.service';
import { ProcedimientoModule } from 'src/modules/identificacion-requerimientos/procedimiento.module';
import { DocumentoSoporteModule } from '../Estados/documento-soporte/documento-soporte/documento-soporte.module';
import { FormulariodaacModule } from '../Estados/documento-soporte/components/formulariodaac/formulariodaac.module';



@Module({
    imports: [
        ProcedimientoModule,
        DocumentoSoporteModule,
        FormulariodaacModule
    ],
    controllers: [ReportController],
    providers: [ReportService],
})
export class ReportsModule { }
