import { Module } from '@nestjs/common';
import { ReportController } from './reports.controller';
import { ReportService } from './reports.service';
import { ProcedimientoModule } from 'src/modules/identificacion-requerimientos/procedimiento.module';
import { DocumentoSoporteModule } from '../../criterios/documento-soporte/documento-soporte/documento-soporte.module';
import { FormulariodaacModule } from '../../criterios/documento-soporte/components/formulariodaac/formulariodaac.module';



@Module({
    imports: [
        ProcedimientoModule,
        DocumentoSoporteModule,
        FormulariodaacModule
    ],
    controllers: [ReportController],
    providers: [ReportService],
    exports: [ReportService],
})
export class ReportsModule { }
