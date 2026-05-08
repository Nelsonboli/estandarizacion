import { PartialType } from '@nestjs/mapped-types';
import { CreateRecoleccionInformacionDto } from './create-recoleccion-informacion.dto';

export class UpdateRecoleccionInformacionDto extends PartialType(CreateRecoleccionInformacionDto) {}
