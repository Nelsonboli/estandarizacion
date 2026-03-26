import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, ParseIntPipe } from '@nestjs/common';
import { ProcedimientoService } from './procedimiento.service';
import { CreateProcedimientoDto } from './dto/create-procedimiento.dto';
import { UpdateProcedimientoDto } from './dto/update-procedimiento.dto';

@Controller('identificacionrequerimientos')
export class ProcedimientoController {
  constructor(private readonly procedimientoService: ProcedimientoService) { }

  @Post()
  create(@Body() createProcedimientoDto: CreateProcedimientoDto) {
    return this.procedimientoService.create(createProcedimientoDto);
  }

  @Get()
  findAll() {
    return this.procedimientoService.findAll();
  }

  @Get('buscar')
  buscar(@Query('termino') termino: string) {
    return this.procedimientoService.buscar(termino);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.procedimientoService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateProcedimientoDto) {
    return this.procedimientoService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.procedimientoService.remove(id);
  }
}
