import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcedimientoModule } from './modules/identificacion-requerimientos/procedimiento.module';
import { DocumentoSoporteModule } from './modules/estandarizacion/criterios/documento-soporte/documento-soporte/documento-soporte.module';
import { FormulariodaacModule } from './modules/estandarizacion/criterios/documento-soporte/components/formulariodaac/formulariodaac.module';
import { ReglamentoBaseModule } from './modules/estandarizacion/criterios/documento-soporte/components/reglamento-base/reglamento-base.module';
import { SoporteComputacionalModule } from './modules/estandarizacion/criterios/soporte-computacional/soporte-computacional.module';
import { ReglamentoModule } from './modules/estandarizacion/criterios/reglamento/reglamento.module';
import { ReportsModule } from './modules/estandarizacion/reportes/reporte-DAAC/reports.module';
import { FormatoEstandarizacionModule } from './modules/estandarizacion/reportes/formato-estandarizacion/formato-estandarizacion.module';
import { SocializacionModule } from './modules/socializacion/socializacion.module';
import { RecoleccionInformacionModule } from './modules/estandarizacion/recoleccion-informacion/recoleccion-informacion.module';
import { AsignacionEstadoModule } from './modules/asignacion-estado/asignacion-estado.module';
import { StorageModule } from './modules/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'udenar123',
      database: process.env.DB_DATABASE || 'estandarizacion_de_procedimientos',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ProcedimientoModule,
    DocumentoSoporteModule,
    FormulariodaacModule,
    ReglamentoBaseModule,
    SoporteComputacionalModule,
    ReglamentoModule,
    ReportsModule,
    FormatoEstandarizacionModule,
    SocializacionModule,
    RecoleccionInformacionModule,
    AsignacionEstadoModule,
    StorageModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }