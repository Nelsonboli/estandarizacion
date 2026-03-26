import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcedimientoModule } from './modules/identificacion-requerimientos/procedimiento.module';
import { DocumentoSoporteModule } from './modules/estandarizacion/Estados/documento-soporte/documento-soporte/documento-soporte.module';
import { FormulariodaacModule } from './modules/estandarizacion/Estados/documento-soporte/components/formulariodaac/formulariodaac.module';
import { ReglamentoBaseModule } from './modules/estandarizacion/Estados/documento-soporte/components/reglamento-base/reglamento-base.module';
import { SoporteComputacionalModule } from './modules/estandarizacion/Estados/soporte-computacional/soporte-computacional.module';
import { ReglamentoModule } from './modules/estandarizacion/Estados/reglamento/reglamento.module';
import { ReportsModule } from './modules/estandarizacion/reports/reports.module';
import { SocializacionModule } from './modules/socializacion/socializacion.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'udenar123',
      database: 'estandarizacion_de_procedimientos',
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
    SocializacionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }