import { PartialType } from '@nestjs/mapped-types';
import { CreateSocializacionDto } from './create-socializacion.dto';

export class UpdateSocializacionDto extends PartialType(CreateSocializacionDto) {}
