import { DatosService } from './../../shared/servicios/datos.service';
import { AlertService } from '../../shared/Utils/Alertas/alert.service';
import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../shared/component/card/card.component';
import { SoporteComputacionalComponent } from '../Estados/soporte-computacional/soporte-computacional.component';
import { ReglamentoComponent } from '../Estados/reglamento/reglamento.component';
import { InicioComponent } from '../Estados/inicio/inicio.component';
import { DocumentacionSoporteComponent } from "../Estados/documentacion-soporte/documentacion-soporte.component";
import { DocumentoSoporteService } from '../../shared/servicios/modulos/documento-soporte.service';


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
    DocumentacionSoporteComponent
  ],
  templateUrl: './estandarizar.component.html',
  styleUrls: ['./estandarizar.component.css'],
})

export class EstandarizarComponent {
  procedimientoId!: number;
  procedimiento: any;
  estadoCompletos: boolean[] = [ false, false, false];
  estado: string = '';
  hoverIndex: number | null = null;
  buttonIndex: number | null = null;
  documentoId!: number;
  
  constructor(
    private route: ActivatedRoute, 
    private alertService: AlertService, 
    private cd:ChangeDetectorRef,
    public datosService: DatosService,
    private documentoSoporteService: DocumentoSoporteService,
  ) {}


  ngOnInit() {
    this.procedimientoId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Procedimiento Seleccionado:', this.procedimientoId);
    //this.cargarDatosEstandarizacion();
  }

  // cargarDatosEstandarizacion(){
  //   this.estandarizacionService.getEstandarizacionPorProcedimiento
  //   (this.procedimientoId).subscribe({
  //     next: (res) => {
  //       if(res.doc?.documento_completado) this.estadoCompletos[0] = true;
  //       // if(res.comp?.computacinal_completado) this.estadoCompletos[1] = true;
  //       // if(res.reg?.reglamento_completado) this.estadoCompletos[2] = true;
  //       this.cd.detectChanges();
  //     },
  //     error: (err) => {
  //     console.error('Error  al cargar estandarizacion',err);
  //   }
  //   })
  // }

onButtonClick(index: number) {
  if (index === 0 || this.estadoCompletos[index - 1]) {
    this.buttonIndex = index;
    if (index === 0) {
      // 1️⃣ Primero obtener documento soporte si ya existe
      this.documentoSoporteService.getPorProcedimiento(this.procedimientoId).subscribe({
        next: (doc: any) => {
          if (doc) {
            // Ya existe → solo asignarlo
            this.documentoId = doc.id;
            this.cd.detectChanges();
          } else {
            // 2️⃣ No existe → crearlo
            this.documentoSoporteService.crearDocumento(this.procedimientoId).subscribe({
              next: (nuevo) => {
                this.documentoId = nuevo.id;
                this.cd.detectChanges();
              },
              error: (err) => {
                console.error('Error creando documento soporte', err);
              }
            });
          }
        },
        error: (err) => {
          console.error('Error obteniendo documento soporte', err);
        }
      });
    }
    this.cd.detectChanges();
  } else {
    this.estado = this.datosService.estados[index - 1];
    const siguiente = this.datosService.estados[index];
    this.alertService.info(`Debe completar todas las actividades del estado ${this.estado} para seguir con ${siguiente}`);
  }
}


  onEstadoCompleto(event: { index: number; completo: boolean }) {
    this.estadoCompletos[event.index] = event.completo;
    this.cd.detectChanges()
  }

  // guardarDatosEstandarizacion() {
  //   this.tablaService.guardarEstandarizacion(this.procedimientoId, this.datosEstandarizacion);
  // }

  // cargarDatosPersistentes() {
  //   const guardados = this.tablaService.getEstandarizacion(this.procedimientoId);
  //   this.datosEstandarizacion = guardados || {};
  //   this.estadoCompletos = this.estados.map((_, i) =>
  //     Array.isArray(guardados?.[i])
  //       ? guardados[i].every((c: boolean) => c === true)
  //       : false
  //   );
  // }
marcarchecklist(index: number) {
  this.estadoCompletos[index] = true;
  this.alertService.alertArriba(`El estado "${this.datosService.estados[index]}" ha sido completado`);

  //  Obtener el procedimiento activo
  const procedimientoId = sessionStorage.getItem('procedimientoActivo');
  if (!procedimientoId) return;

  //  Cargar lo que ya esté en localStorage
  const guardados = JSON.parse(localStorage.getItem('estandarizaciones') || '{}');
  guardados[procedimientoId] = guardados[procedimientoId] || {};

  //  Obtener la cantidad de subopciones según el índice del estado
   // ["Actividades del procedimiento", "Roles del procedimiento", "Referencias"],
  const opcionesPorEstado = [
   
    ["Formulario de procedimiento DAAC", "Reglamento base", "Diagrama de procedimiento"],
    ["Soporte computacional"],
    ["Procedimiento Enviado DAAC", "Procedimiento aprobado por la DAAC"]
  ];

  const totalChecks = opcionesPorEstado[index].length;
  guardados[procedimientoId][index] = Array(totalChecks).fill(true);

  //  Guardar en localStorage
  localStorage.setItem('estandarizaciones', JSON.stringify(guardados));

  //  Actualizar visualmente en pantalla
  this.estadoCompletos[index] = true;
}

}
