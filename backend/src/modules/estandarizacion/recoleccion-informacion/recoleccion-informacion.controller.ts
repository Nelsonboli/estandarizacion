import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { RecoleccionInformacionService } from './recoleccion-informacion.service';
import { UpdateRecoleccionInformacionDto } from './dto/update-recoleccion-informacion.dto';

@Controller('recoleccion-informacion')
export class RecoleccionInformacionController {
  constructor(private readonly recoleccionInformacionService: RecoleccionInformacionService) { }

  @Post(':id')
  crearPorProcedimiento(@Param('id', ParseIntPipe) procedimientoId: number) {
    return this.recoleccionInformacionService.crearPorProcedimiento(procedimientoId);
  }

  @Get('obtener-por-procedimiento/:id')
  obtenerPorProcedimiento(@Param('id', ParseIntPipe) procedimientoId: number) {
    return this.recoleccionInformacionService.obtenerPorProcedimiento(procedimientoId);
  }

  @Get()
  findAll() {
    return this.recoleccionInformacionService.findAll();
  }

  @Put(':id')
  actualizarRecoleccionInformacion(@Param('id', ParseIntPipe) id: number, @Body() updateRecoleccionInformacionDto: UpdateRecoleccionInformacionDto) {
    return this.recoleccionInformacionService.actualizarRecoleccionInformacion(id, updateRecoleccionInformacionDto);
  }

  @Delete(':id')
  eliminarRecoleccionInformacion(@Param('id', ParseIntPipe) id: number) {
    return this.recoleccionInformacionService.eliminarRecoleccionInformacion(id);
  }
}
