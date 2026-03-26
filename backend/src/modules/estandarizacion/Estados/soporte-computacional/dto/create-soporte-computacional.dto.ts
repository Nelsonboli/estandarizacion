import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSoporteComputacionalDto {
    @IsOptional()
    @IsNumber()
    procedimiento_id?: number;

    @IsOptional()
    @IsBoolean()
    tiene_soporte?: boolean;

    @IsOptional()
    @IsString()
    nombre?: string | null;

    @IsOptional()
    @IsString()
    descripcion?: string | null;

    @IsOptional()
    @IsBoolean()
    requiere_soporte?: boolean;

    @IsOptional()
    @IsBoolean()
    computacional_completado?: boolean;
}


