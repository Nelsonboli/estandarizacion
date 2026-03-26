import { Controller, Get, Param, Res, ParseIntPipe } from '@nestjs/common';
import type { Response } from 'express';
import { ReportService } from './reports.service';

@Controller('report')
export class ReportController {

    constructor(private readonly service: ReportService) { }

    @Get(':id')
    async generar(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        try {
            const pdfPath = await this.service.generarReporte(id);
            res.sendFile(pdfPath);
        } catch (error) {
            res.status(500).json({
                message: 'Error al generar el reporte',
                error: error.message
            });
        }
    }

}
