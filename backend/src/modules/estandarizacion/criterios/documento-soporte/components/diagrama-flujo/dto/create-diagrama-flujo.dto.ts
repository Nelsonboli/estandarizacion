import { IsOptional, IsString, IsObject, IsNumber } from 'class-validator';

export class CreateDiagramaFlujoDto {
    @IsOptional() @IsNumber()
    documento_soporte_id?: number;

    @IsOptional() @IsString()
    documento_diagrama?: string | null;

    @IsOptional() @IsString()
    pdf_diagrama?: string | null; // Base64 content from frontend

    @IsOptional() @IsObject()
    json_diagrama?: any | null;

    @IsOptional()
    imagenes?: string[];
}
