import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Put } from '@nestjs/common';
import { SoporteComputacionalService } from './soporte-computacional.service';
import { UpdateSoporteComputacionalDto } from './dto/update-soporte-computacional.dto';

@Controller('soporte-computacional')
export class SoporteComputacionalController {
  constructor(private readonly soporteComputacionalService: SoporteComputacionalService) { }

  @Post('crear-por-procedimiento/:id')
  crearPorProcedimiento(@Param('id', ParseIntPipe) procedimientoId: number) {
    return this.soporteComputacionalService.crearSoporteComputacionalPorProcedimiento(procedimientoId);
  }

  @Get('obtener-por-procedimiento/:id')
  getPorProcedimiento(@Param('id', ParseIntPipe) procedimientoId: number) {
    return this.soporteComputacionalService.getPorProcedimiento(procedimientoId);
  }

  @Get()
  findAll() {
    return this.soporteComputacionalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.soporteComputacionalService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSoporteComputacionalDto: UpdateSoporteComputacionalDto) {
    return this.soporteComputacionalService.update(id, updateSoporteComputacionalDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.soporteComputacionalService.remove(id);
  }
}
