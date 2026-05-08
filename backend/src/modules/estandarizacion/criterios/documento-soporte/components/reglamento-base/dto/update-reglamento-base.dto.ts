import { PartialType } from '@nestjs/mapped-types';
import { CreateReglamentoBaseDto } from './create-reglamento-base.dto';

export class UpdateReglamentoBaseDto extends PartialType(CreateReglamentoBaseDto) { }
