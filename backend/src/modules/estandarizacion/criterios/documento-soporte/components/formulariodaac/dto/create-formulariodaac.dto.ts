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
    responsable: any[];

    @IsArray()
    @IsOptional()
    proveedores: any[];

    @IsArray()
    @IsOptional()
    insumos: any[];

    @IsArray()
    @IsOptional()
    resultados: any[];

    @IsArray()
    @IsOptional()
    recibe: any[];

    @IsArray()
    @IsOptional()
    requisitos: any[];

    @IsArray()
    @IsOptional()
    documentos: any[];

    @IsArray()
    @IsOptional()
    registros: any[];

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

    @IsOptional()
    @IsNumber()
    id?: number;
}
