import { IsBoolean, IsNumber, IsObject, IsString } from "class-validator";

export class CreateReglamentoDto {
    @IsNumber()
    procedimiento_id?: number;
    @IsString()
    formato_daac_descargado: string;
    @IsString()
    formato_daac_subido: string;
    @IsString()
    formato_estandarizacion_descargado: string;
    @IsString()
    formato_estandarizacion_subido: string;

    @IsObject()
    actividades_completadas: {
        descarga_daac_completada: boolean;
        subida_daac_completada: boolean;
    } | null;
    @IsBoolean()
    reglamento_completado: boolean;
}
