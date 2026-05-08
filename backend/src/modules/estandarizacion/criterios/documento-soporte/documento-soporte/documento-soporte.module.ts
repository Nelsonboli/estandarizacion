import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentoSoporteService } from './documento-soporte.service';
import { DocumentoSoporteController } from './documento-soporte.controller';
import { DocumentoSoporte } from './entities/documento-soporte.entity';
import { Procedimiento } from 'src/modules/identificacion-requerimientos/entities/procedimiento.entity';
import { DiagramaFlujoModule } from '../components/diagrama-flujo/diagrama-flujo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentoSoporte, Procedimiento]),
    forwardRef(() => DiagramaFlujoModule),
  ],
  controllers: [DocumentoSoporteController],
  providers: [DocumentoSoporteService],
  exports: [TypeOrmModule, DocumentoSoporteService],
})
export class DocumentoSoporteModule { }
