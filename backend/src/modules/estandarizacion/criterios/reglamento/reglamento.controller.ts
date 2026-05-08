import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Put, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReglamentoService } from './reglamento.service';
import { UpdateReglamentoDto } from './dto/update-reglamento.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('reglamento')
export class ReglamentoController {
  constructor(private readonly reglamentoService: ReglamentoService) { }

  @Post('crear-por-procedimiento/:id')
  crearPorProcedimiento(@Param('id', ParseIntPipe) procedimientoId: number) {
    return this.reglamentoService.createReglamentoPorProcedimiento(procedimientoId);
  }

  @Get('obtener-por-procedimiento/:id')
  obtenerPorProcedimiento(@Param('id', ParseIntPipe) procedimientoId: number) {
    return this.reglamentoService.getPorProcedimiento(procedimientoId)
  }

  @Get()
  findAll() {
    return this.reglamentoService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reglamentoService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateReglamentoDto: UpdateReglamentoDto) {
    return this.reglamentoService.update(id, updateReglamentoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reglamentoService.remove(id);
  }

  @Post(':id/subir-formato-daac')
  @UseInterceptors(FileInterceptor('file'))
  subirFormatoDAAC(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.reglamentoService.subirFormatoDAAC(id, file);
  }

  @Delete(':id/eliminar-formato-daac')
  eliminarFormatoDAAC(@Param('id', ParseIntPipe) id: number) {
    return this.reglamentoService.eliminarFormatoDAAC(id);
  }

  @Put(':id/marcar-descarga')
  marcarDescarga(
    @Param('id', ParseIntPipe) id: number,
    @Body('fileName') fileName: string,
  ) {
    return this.reglamentoService.marcarComoDescargado(id, fileName);
  }

  // @Post(':id/subir-formato-estandarizacion')
  // @UseInterceptors(FileInterceptor('file'))
  // subirFormatoEstandarizacion(
  //   @Param('id', ParseIntPipe) id: number,
  //   @UploadedFile() file: Express.Multer.File,
  // ) {
  //   return this.reglamentoService.subirFormatoEstandarizacion(id, file);
  // }

  // @Delete(':id/eliminar-formato-estandarizacion')
  // eliminarFormatoEstandarizacion(@Param('id', ParseIntPipe) id: number) {
  //   return this.reglamentoService.eliminarFormatoEstandarizacion(id);
  // }

  // @Put(':id/marcar-descarga-estandarizacion')
  // marcarDescargaEstandarizacion(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body('fileName') fileName: string,
  // ) {
  //   return this.reglamentoService.marcarComoDescargadoEstandarizacion(id, fileName);
  // }

}
