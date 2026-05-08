import { Controller, Get, Res, Param, ParseIntPipe } from '@nestjs/common';
import { FormatoEstandarizacionService } from './formato-estandarizacion.service';
import type { Response } from 'express';

@Controller('formato-estandarizacion')
export class FormatoEstandarizacionController {
  constructor(private readonly formatoEstandarizacionService: FormatoEstandarizacionService) { }

  @Get(':id')
  async generarReporte(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    try {
      const pdfPath = await this.formatoEstandarizacionService.generarReporteEstandarizacion(id);
      res.sendFile(pdfPath);
    }
    catch (error) {
      console.error('Error generando reporte de estandarizacion:', error);
      res.status(500).json({
        message: 'Error al generar el reporte de estandarización',
        error: error.message
      });
    }
  }
}
