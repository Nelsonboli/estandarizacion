import { PartialType } from '@nestjs/mapped-types';
import { CreateSoporteComputacionalDto } from './create-soporte-computacional.dto';

export class UpdateSoporteComputacionalDto extends PartialType(CreateSoporteComputacionalDto) { }
