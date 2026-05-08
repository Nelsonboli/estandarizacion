import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRecoleccionInformacionDto {
    @IsNumber()
    @IsNotEmpty()
    procedimiento_id: number;

    @IsString()
    @IsNotEmpty()
    encuesta: string;

}
