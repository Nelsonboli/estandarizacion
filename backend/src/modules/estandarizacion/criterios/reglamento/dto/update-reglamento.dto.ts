import { PartialType } from '@nestjs/mapped-types';
import { CreateReglamentoDto } from './create-reglamento.dto';

export class UpdateReglamentoDto extends PartialType(CreateReglamentoDto) { }
