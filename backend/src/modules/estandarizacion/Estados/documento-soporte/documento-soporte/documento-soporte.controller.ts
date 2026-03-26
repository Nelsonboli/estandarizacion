import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe } from '@nestjs/common';
import { DocumentoSoporteService } from './documento-soporte.service';
import { UpdateDocumentoSoporteDto } from './dto/update-documento-soporte.dto';

@Controller('documento_soporte')
export class DocumentoSoporteController {
  constructor(private readonly documentoService: DocumentoSoporteService) { }


  @Post('crear-documento/:procedimientoId')
  crearPorProcedimiento(@Param('procedimientoId', ParseIntPipe) procedimientoId: number) {
    return this.documentoService.crearDocumentoSoporte(procedimientoId);
  }

  @Get('por-procedimiento/:procedimientoId')
  getPorProcedimiento(@Param('procedimientoId', ParseIntPipe) procedimientoId: number) {
    return this.documentoService.getPorProcedimiento(procedimientoId);
  }

  @Get()
  findAll() {
    return this.documentoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentoService.findOne(id);
  }


  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDocumentoSoporteDto) {
    console.log('Actualizando documento soporte:', id, 'con datos:', dto);
    return this.documentoService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentoService.remove(id);
  }
}
