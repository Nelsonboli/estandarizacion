import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put } from '@nestjs/common';
import { AsignacionEstadoService } from './asignacion-estado.service';
import { UpdateAsignacionEstadoDto } from './dto/update-asignacion_estado.dto';

@Controller('asignacion_estado')
export class AsignacionEstadoController {
  constructor(private readonly asignacionEstadoService: AsignacionEstadoService) { }

  @Post('crear/:procedimientoId')
  crearPorProcedimiento(@Param('procedimientoId', ParseIntPipe) procedimientoId: number) {
    return this.asignacionEstadoService.crearPorProcedimiento(procedimientoId);
  }

  @Get()
  findAll() {
    return this.asignacionEstadoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.asignacionEstadoService.findOne(id);
  }

  @Get('obtener-por-procedimiento/:id')
  findByProcedimiento(@Param('id', ParseIntPipe) id: number) {
    return this.asignacionEstadoService.findByProcedimiento(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAsignacionEstadoDto) {
    return this.asignacionEstadoService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asignacionEstadoService.remove(id);
  }
}
