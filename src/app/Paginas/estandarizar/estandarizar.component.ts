import { AlertService } from './../../shared/servicios/alert.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../shared/component/card/card.component';
import { SoporteComputacionalComponent } from '../Estados/soporte-computacional/soporte-computacional.component';
import { ReglamentoComponent } from '../Estados/reglamento/reglamento.component';
import { InicioComponent } from '../Estados/inicio/inicio.component';
import { UnificacionCriteriosComponent } from "../Estados/unificacion-criterios/unificacion-criterios.component";
import { DocumentacionSoporteComponent } from "../Estados/documentacion-soporte/documentacion-soporte.component";
import { TablaService } from '../../shared/servicios/tabla.service';

@Component({
  standalone: true,
  selector: 'app-estandarizar',
  imports: [
    CardComponent,
    SoporteComputacionalComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReglamentoComponent,
    InicioComponent,
    UnificacionCriteriosComponent,
    DocumentacionSoporteComponent
  ],
  templateUrl: './estandarizar.component.html',
  styleUrls: ['./estandarizar.component.css'],
})

export class EstandarizarComponent {
  hoverIndex: number | null = null;
  buttonIndex: number | null = null;
  estadoCompletos: boolean[] = [false, false, false, false];
  estados = [
    "Unificación de Criterios",
    "Documento de Soporte",
    "Soporte Computacional",
    "Reglamento"
  ];
  procedimientoId: string = '';
  procedimiento: any;
  datosEstandarizacion: any = {};
  estado: string = '';
  
  constructor(private route: ActivatedRoute, private tablaService: TablaService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.procedimientoId = this.route.snapshot.paramMap.get('id')!;
    this.tablaService.getProcedimientos().subscribe(procs => {
      this.procedimiento = procs.find(p => p.id == this.procedimientoId);
      this.cargarDatosPersistentes();
    });
  }

  onButtonClick(index: number) {
    
    if (index === 0 || this.estadoCompletos[index-1]) {
      this.buttonIndex = index;
      this.hoverIndex = null;
    } 
    else {
      this.estado = this.estados[index-1];
      const siguiente = this.estados[index];
      this.alertService.info(`Debe completar todas las actividades del estado ${this.estado}  para seguir con ${siguiente}`)
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
    this.datosEstandarizacion = guardados || {};
    this.estadoCompletos = this.estados.map((_, i) =>
      Array.isArray(guardados?.[i])
        ? guardados[i].every((c: boolean) => c === true)
        : false
    );
  }
}
