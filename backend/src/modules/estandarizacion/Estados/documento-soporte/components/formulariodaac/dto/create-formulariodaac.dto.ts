import { IsString, IsNotEmpty, IsArray, IsNumber, IsOptional } from 'class-validator';

export class CreateFormulariodaacDto {
    @IsString()
    @IsNotEmpty()
    objetivo: string;

    @IsString()
    @IsNotEmpty()
    alcance: string;

    @IsArray()
    @IsOptional()
    responsable: [];

    @IsArray()
    @IsOptional()
    proveedores: [];

    @IsArray()
    @IsOptional()
    insumos: [];

    @IsArray()
    @IsOptional()
    resultados: [];

    @IsArray()
    @IsOptional()
    recibe: [];

    @IsArray()
    @IsOptional()
    requisitos: [];

    @IsArray()
    @IsOptional()
    documentos: [];

    @IsArray()
    @IsOptional()
    registros: [];

    @IsString()
    @IsNotEmpty()
    indicador: string;

    @IsString()
    @IsNotEmpty()
    formula: string;

    @IsString()
    @IsNotEmpty()
    frecuencia: string;

    @IsNumber()
    @IsNotEmpty()
    documento_soporte_id: number;
}
