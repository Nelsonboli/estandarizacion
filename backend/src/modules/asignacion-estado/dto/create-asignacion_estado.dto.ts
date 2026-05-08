import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";


export class CreateAsignacionEstadoDto {

    @IsNumber()
    @IsOptional()
    id_procedimiento?: number;

    @IsBoolean()
    criterios_completos: boolean;

    @IsString()
    estado_procedimiento: string;

    @IsString()
    @IsOptional()
    estado_inicial?: string;
}
