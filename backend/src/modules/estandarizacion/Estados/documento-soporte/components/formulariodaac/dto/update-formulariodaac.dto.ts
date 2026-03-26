import { PartialType } from '@nestjs/mapped-types';
import { CreateFormulariodaacDto } from './create-formulariodaac.dto';

export class UpdateFormulariodaacDto extends PartialType(CreateFormulariodaacDto) {}
