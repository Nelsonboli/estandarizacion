import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ReglamentoBaseService } from './reglamento-base.service';
import { CreateReglamentoBaseDto } from './dto/create-reglamento-base.dto';
import { UpdateReglamentoBaseDto } from './dto/update-reglamento-base.dto';

@Controller('reglamento_base')
export class ReglamentoBaseController {
  constructor(private readonly reglamentoBaseService: ReglamentoBaseService) { }

  @Post()
  create(@Body() createReglamentoBaseDto: CreateReglamentoBaseDto) {
    return this.reglamentoBaseService.createByDocumentoSoporte(createReglamentoBaseDto);
  }

  @Get()
  findAll() {
    return this.reglamentoBaseService.findAll();
  }

  @Get('por-documento/:id')
  async obtenerPorDocumento(@Param('id', ParseIntPipe) documentoSoporteId: number) {
    return this.reglamentoBaseService.findByDocumentoSoporte(documentoSoporteId);
  }

  @Get('por-reglamento-base/:id')
  async obtenerPorReglamentoBase(@Param('id', ParseIntPipe) id: number) {
    return this.reglamentoBaseService.findByDocumentoSoporte(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reglamentoBaseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateReglamentoBaseDto: UpdateReglamentoBaseDto) {
    return this.reglamentoBaseService.update(+id, updateReglamentoBaseDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reglamentoBaseService.remove(+id);
  }
}
