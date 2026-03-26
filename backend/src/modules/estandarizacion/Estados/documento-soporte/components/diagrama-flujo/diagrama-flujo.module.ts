import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagramaFlujo } from './entities/diagrama-flujo.entity';
import { DiagramaFlujoService } from './diagrama-flujo.service';
import { DiagramaFlujoController } from './diagrama-flujo.controller';
import { DocumentoSoporteModule } from '../../documento-soporte/documento-soporte.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiagramaFlujo]),
    forwardRef(() => DocumentoSoporteModule),
  ],
  controllers: [DiagramaFlujoController],
  providers: [DiagramaFlujoService],
  exports: [DiagramaFlujoService],
})
export class DiagramaFlujoModule {}
