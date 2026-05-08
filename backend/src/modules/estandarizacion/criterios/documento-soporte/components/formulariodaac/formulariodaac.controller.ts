import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { FormulariodaacService } from './formulariodaac.service';
import { CreateFormulariodaacDto } from './dto/create-formulariodaac.dto';
import { UpdateFormulariodaacDto } from './dto/update-formulariodaac.dto';

@Controller('formulariodaac')
export class FormulariodaacController {
  constructor(private readonly formulariodaacService: FormulariodaacService) { }

  @Post()
  create(@Body() createFormulariodaacDto: CreateFormulariodaacDto) {
    return this.formulariodaacService.createConDocumento(createFormulariodaacDto);
  }

  @Get()
  findAll() {
    return this.formulariodaacService.findAll();
  }

  @Get('por-documento/:id')
  obtenerPorDocumento(@Param('id', ParseIntPipe) id: number) {
    return this.formulariodaacService.findByDocumento(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.formulariodaacService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFormulariodaacDto: UpdateFormulariodaacDto) {
    return this.formulariodaacService.update(id, updateFormulariodaacDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.formulariodaacService.remove(id);
  }
}
