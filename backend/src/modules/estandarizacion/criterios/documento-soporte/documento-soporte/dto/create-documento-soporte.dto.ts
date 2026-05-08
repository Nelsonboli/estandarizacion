import { IsBoolean, IsNumber, IsOptional, IsString, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class ActividadesCompletadasDto {
  @IsOptional() @IsBoolean()
  formulario?: boolean;

  @IsOptional() @IsBoolean()
  reglamentoBase?: boolean;

  @IsOptional() @IsBoolean()
  diagramaFlujo?: boolean;
}

export class CreateDocumentoSoporteDto {
  @IsOptional() @IsNumber()
  procedimiento_id?: number;

  @IsOptional() @IsBoolean()
  documento_completado?: boolean;

  @IsOptional() @IsObject() @ValidateNested() @Type(() => ActividadesCompletadasDto)
  actividades_completadas?: ActividadesCompletadasDto | null;
}

