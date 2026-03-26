import { Module } from '@nestjs/common';
import { FormulariodaacService } from './formulariodaac.service';
import { FormulariodaacController } from './formulariodaac.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Formulariodaac } from './entities/formulariodaac.entity';
import { DocumentoSoporte } from 'src/modules/estandarizacion/Estados/documento-soporte/documento-soporte/entities/documento-soporte.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Formulariodaac, DocumentoSoporte])],
  controllers: [FormulariodaacController],
  providers: [FormulariodaacService],
  exports: [TypeOrmModule, FormulariodaacService],
})
export class FormulariodaacModule { }
