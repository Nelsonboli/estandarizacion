import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateReglamentoBaseDto {
    @IsString()
    @IsOptional()
    documento: string | undefined;

    @IsNumber()
    @IsNotEmpty()
    documento_soporte_id: number;
}
