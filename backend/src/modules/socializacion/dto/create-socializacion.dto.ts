import { IsString, IsDate, IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateSocializacionDto {

    @IsString()
    lugar: string;

    @IsString()
    mecanismo: string;

    @IsDate()
    @Type(() => Date)
    fecha: Date;

    @IsDate()
    @Type(() => Date)
    hora: Date;

    @IsNumber()
    @IsOptional()
    procedimiento_id?: number;

}
