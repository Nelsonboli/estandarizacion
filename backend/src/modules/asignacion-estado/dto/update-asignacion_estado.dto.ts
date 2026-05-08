import { PartialType } from '@nestjs/mapped-types';
import { CreateAsignacionEstadoDto } from './create-asignacion_estado.dto';

export class UpdateAsignacionEstadoDto extends PartialType(CreateAsignacionEstadoDto) {}
