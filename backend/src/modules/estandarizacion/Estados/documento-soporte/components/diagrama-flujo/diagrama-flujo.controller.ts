import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { DiagramaFlujoService } from './diagrama-flujo.service';
import { CreateDiagramaFlujoDto } from './dto/create-diagrama-flujo.dto';

@Controller('diagrama_flujo')
export class DiagramaFlujoController {
  constructor(private readonly diagramaFlujoService: DiagramaFlujoService) { }

  @Post('guardar-diagrama/:id')
  guardarDiagrama(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: CreateDiagramaFlujoDto
  ) {
    return this.diagramaFlujoService.guardarDiagrama(id, data);
  }

  @Get('get-diagrama-pdf/:id')
  getDiagramaPdf(@Param('id', ParseIntPipe) id: number) {
    return this.diagramaFlujoService.getDiagramaPdf(id);
  }

  @Get(':id')
  obtenerPorDocumento(@Param('id', ParseIntPipe) id: number) {
    return this.diagramaFlujoService.obtenerPorDocumento(id);
  }

  @Delete('eliminar-diagrama/:id')
  eliminarDiagrama(@Param('id', ParseIntPipe) id: number) {
    return this.diagramaFlujoService.eliminarDiagrama(id);
  }
}
