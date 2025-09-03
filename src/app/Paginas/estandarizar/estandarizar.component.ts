import { Component } from '@angular/core';
import { CardComponent } from '../../shared/component/card/card.component';
import { CommonModule } from '@angular/common';
import { SoporteComputacionalComponent } from '../Estados/soporte-computacional/soporte-computacional.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReglamentoComponent } from '../Estados/reglamento/reglamento.component';
import { InicioComponent } from '../Estados/inicio/inicio.component';
import { UnificacionCriteriosComponent } from "../Estados/unificacion-criterios/unificacion-criterios.component";
import { DocumentacionSoporteComponent } from "../Estados/documentacion-soporte/documentacion-soporte.component";
import { ActivatedRoute } from '@angular/router';
import { TablaService } from '../../shared/servicios/tabla.service';

@Component({
  standalone: true,
  selector: 'app-estandarizar',
  imports: [CardComponent, SoporteComputacionalComponent, CommonModule,
    FormsModule, ReactiveFormsModule, ReglamentoComponent, InicioComponent, UnificacionCriteriosComponent, DocumentacionSoporteComponent],
  templateUrl: './estandarizar.component.html',
  styleUrls: ['./estandarizar.component.css'],
})

export class EstandarizarComponent {
  hoverIndex: number | null = null;
  buttonIndex: number | null = null;
  estadoCompletos: boolean[] = [false, false, false, false];
  estados = [" Unificación de Criterios", "Documento de Soporte", "Soporte Computacional", "Reglamento"];
  procedimientoId: string = '';
  procedimiento: any;
  datosEstandarizacion: any = {};

  constructor(private route: ActivatedRoute, private tablaService: TablaService) { }

  ngOnInit() {
    this.procedimientoId = this.route.snapshot.paramMap.get('id')!;
    this.tablaService.getProcedimientos().subscribe(procs => {
      this.procedimiento = procs.find(p => p.id == this.procedimientoId);
      // Carga los datos persistentes aquí
      this.cargarDatosPersistentes();
    });
  }

  onButtonClick(index: number) {
    if (index === 0 || this.estadoCompletos[index - 1]) {
      this.buttonIndex = index;
      this.hoverIndex = null;
    }
  }

  onEstadoCompleto(event: { index: number; completo: boolean }) {
    this.estadoCompletos[event.index] = event.completo;
  }

  guardarDatosEstandarizacion() {
    this.tablaService.guardarEstandarizacion(this.procedimientoId, this.datosEstandarizacion);
  }
  cargarDatosPersistentes() {
    const guardados = this.tablaService.getEstandarizacion(this.procedimientoId);
    this.datosEstandarizacion = guardados;

    this.estadoCompletos = this.estados.map((_, i) =>
      guardados?.[i]?.every((c: boolean) => c === true)
    );
  }

} 
