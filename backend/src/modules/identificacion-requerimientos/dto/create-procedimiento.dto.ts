import { IsString, IsIn, IsArray, IsOptional, IsNumber } from 'class-validator';

export class CreateProcedimientoDto {
  @IsString()
  procedimiento: string;

  @IsString()
  @IsIn([
    'Procesos Estratégicos - Direccionamiento Estratégico',
    'Procesos Estratégicos - Gestión de Calidad',
    'Procesos Misionales - Formación Academica',
    'Procesos Misionales - Investigación',
    'Procesos Misionales - Interacción Social',
    'Procesos de Apoyo - Gestión de Información y Tecnología',
    'Procesos de Apoyo - Gestión de Recursos físicos',
    'Procesos de Apoyo - Gestión Jurídica',
    'Procesos de Apoyo - Soporte a Procesos Misionales',
    'Procesos de Apoyo - Gestión de Bienestar Universitario',
    'Procesos de Apoyo - Gestión Financiera',
    'Procesos de Apoyo - Gestión de Comunicaciones',
    'Procesos de Apoyo - Gestión Documental',
    'Procesos de Apoyo - Gestión Humana',
  ])
  categoria: string;

  @IsArray()
  roles: any[];

  @IsString()
  @IsIn([
    'Inicial', 'Intermedio 1', 'Intermedio 2', 'Intermedio 3', 'Completo',
    'inicial', 'intermedio 1', 'intermedio 2', 'intermedio 3', 'completo'
  ])
  estado: string;

  @IsArray()
  actividades: any[];

  @IsArray()
  referencias: any[];

  @IsOptional()
  @IsNumber()
  id?: number;
}
