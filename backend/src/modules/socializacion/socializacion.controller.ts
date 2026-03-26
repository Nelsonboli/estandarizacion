import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus } from '@nestjs/common';
import { SocializacionService } from './socializacion.service';
import { CreateSocializacionDto } from './dto/create-socializacion.dto';
import { UpdateSocializacionDto } from './dto/update-socializacion.dto';
import express from 'express';

@Controller('socializacion')
export class SocializacionController {
  constructor(private readonly socializacionService: SocializacionService) { }

  @Get('unir-pdfs/:procedimientoId')
  async unirPdfs(@Param('procedimientoId') procedimientoId: string, @Res() res: express.Response) {
    try {
      const buffer = await this.socializacionService.unirPdfsPorProcedimiento(+procedimientoId);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; ${procedimientoId}_socializacion.pdf`,
        'Content-Length': buffer.length,
      });

      res.status(HttpStatus.OK).send(buffer);
    } catch (error) {
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Error al unir los archivos PDF',
      });
    }
  }

  @Post()
  create(@Body() createSocializacionDto: CreateSocializacionDto) {
    return this.socializacionService.createSocializacion(createSocializacionDto);
  }

  @Get()
  findAll() {
    return this.socializacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.socializacionService.findOne(+id);
  }

  @Get('procedimiento/:id')
  findByProcedimiento(@Param('id') id: string) {
    return this.socializacionService.findByProcedimiento(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSocializacionDto: UpdateSocializacionDto) {
    return this.socializacionService.update(+id, updateSocializacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.socializacionService.remove(+id);
  }
}
