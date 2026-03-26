import { Module } from '@nestjs/common';
import { ReglamentoService } from './reglamento.service';
import { ReglamentoController } from './reglamento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Procedimiento } from 'src/modules/identificacion-requerimientos/entities/procedimiento.entity';
import { Reglamento } from './entities/reglamento.entity';

@Module({

  imports: [TypeOrmModule.forFeature([Reglamento, Procedimiento])],
  controllers: [ReglamentoController],
  providers: [ReglamentoService],
})
export class ReglamentoModule { }
