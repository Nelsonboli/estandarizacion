import { Module } from '@nestjs/common';
import { ReglamentoBaseService } from './reglamento-base.service';
import { ReglamentoBaseController } from './reglamento-base.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReglamentoBase } from './entities/reglamento-base.entity';
import { DocumentoSoporte } from 'src/modules/estandarizacion/Estados/documento-soporte/documento-soporte/entities/documento-soporte.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReglamentoBase, DocumentoSoporte])],
  controllers: [ReglamentoBaseController],
  providers: [ReglamentoBaseService],
})
export class ReglamentoBaseModule { }
