import { DatosService } from './../../shared/servicios/datos.service';
import { AlertService } from '../../shared/Utils/Alertas/alert.service';
import { ChangeDetectorRef, Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../shared/component/card/card.component';
import { SoporteComputacionalComponent } from '../Estados/soporte-computacional/soporte-computacional.component';
import { ReglamentoComponent } from '../Estados/reglamento/reglamento.component';
import { InicioComponent } from '../Estados/inicio/inicio.component';
import { DocumentacionSoporteComponent } from "../Estados/documentacion-soporte/documentacion-soporte.component";
import { DocumentoSoporteService } from '../../shared/servicios/modulos/documento-soporte.service';
import { SoporteComputacionalService } from '../../shared/servicios/modulos/soporte-computacional.service';

@Component({
  standalone: true,
  selector: 'app-estandarizar',
  imports: [
    CardComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReglamentoComponent,
    InicioComponent,
    DocumentacionSoporteComponent,
    SoporteComputacionalComponent
  ],
  templateUrl: './estandarizar.component.html',
  styleUrls: ['./estandarizar.component.css'],
})

export class EstandarizarComponent {
  procedimientoId!: number;
  procedimiento: any;
  estadoCompletos: boolean[] = [false, false, false];
  estado: string = '';
  hoverIndex: number | null = null;
  buttonIndex: number | null = null;
  documentoId!: number;

  @Input() valoresExternos: boolean[] | null = null;

  actividadesDocumentoSoporte: boolean[] = [false, false, false];
  actividadesSoporteComputacional: boolean[] = [false];
  actividadesReglamento: boolean[] = [false];

  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    private cd: ChangeDetectorRef,
    public datosService: DatosService,
    private documentoSoporteService: DocumentoSoporteService,
    private soporteComputacionalService: SoporteComputacionalService,
  ) { }

  ngOnInit() {
    this.procedimientoId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Procedimiento Seleccionado:', this.procedimientoId);
    // Cargar estado inicial del documento de soporte
    this.cargarEstadoDocumentoSoporte();
    // Cargar estado inicial del soporte computacional
    this.cargarSoporteComputacional();
  }

  onButtonClick(index: number) {
    if (index === 0 || this.estadoCompletos[index - 1]) {
      if (index === 0) {
        // Primero obtener o crear el documento de soporte
        this.documentoSoporteService.getPorProcedimiento(this.procedimientoId).subscribe({
          next: (doc: any) => {
            if (doc) {
              // Ya existe → asignarlo y mostrar
              this.documentoId = doc.id;
              if (doc.actividades_completadas) {
                this.actividadesDocumentoSoporte = [
                  doc.actividades_completadas.formulario,
                  doc.actividades_completadas.reglamentoBase,
                  doc.actividades_completadas.diagramaFlujo
                ];
              }
              if (doc.documento_completado) {
                this.estadoCompletos[0] = true;
              }
              // Ahora sí, mostrar el componente
              this.buttonIndex = index;
              this.cd.detectChanges();
            } else {
              // No existe → crearlo primero
              this.documentoSoporteService.crearDocumento(this.procedimientoId).subscribe({
                next: (nuevo) => {
                  this.documentoId = nuevo.id;
                  // Ahora sí, mostrar el componente
                  this.buttonIndex = index;
                  this.cd.detectChanges();
                },
                error: (err) => {
                  console.error('Error creando documento soporte', err);
                  this.alertService.error('Error al crear el documento de soporte');
                }
              });
            }
          },
          error: (err) => {
            console.error('Error obteniendo documento soporte', err);
            this.alertService.error('Error al obtener el documento de soporte');
          }
        });
      } else {
        // Para otros estados, mostrar inmediatamente
        this.buttonIndex = index;
        this.cd.detectChanges();
      }
    } else {
      this.estado = this.datosService.estados[index - 1];
      const siguiente = this.datosService.estados[index];
      this.alertService.info(`Debe completar todas las actividades del estado ${this.estado} para seguir con ${siguiente}`);
    }
  }

  // Cargar el estado del soporte computacional al inicializar
  cargarSoporteComputacional() {
    console.log('🔍 Cargando estado del soporte computacional para procedimiento:', this.procedimientoId);
    this.soporteComputacionalService.getSoporteComputacional(this.procedimientoId).subscribe({
      next: (soporte: any) => {
        console.log('📦 Soporte computacional recibido del backend:', soporte);
        if (soporte) {
          // Verificar si el formulario está completo
          let completado = false;
          if (soporte.tiene_soporte === true) {
            completado = !!(soporte.nombre && soporte.descripcion);
          } else if (soporte.tiene_soporte === false) {
            completado = soporte.requiere_soporte !== null && soporte.requiere_soporte !== undefined;
          }

          this.actividadesSoporteComputacional = [completado];
          console.log('📥 Actividades soporte computacional cargadas:', this.actividadesSoporteComputacional);

          // Verificar si el soporte computacional está completado
          if (soporte.computacional_completado) {
            this.estadoCompletos[1] = true;
            console.log('✅ Estado inicial: Soporte computacional completado');
          } else {
            this.estadoCompletos[1] = false;
            console.log('⏳ Soporte computacional en progreso');
          }
          console.log('📊 Estado final - estadoCompletos:', this.estadoCompletos);
          console.log('📊 Estado final - actividadesSoporteComputacional:', this.actividadesSoporteComputacional);
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        console.log('ℹ️ No existe soporte computacional aún');
        this.estadoCompletos[1] = false;
        this.actividadesSoporteComputacional = [false];
      }
    });
  }

  // Cargar el estado del documento de soporte al inicializar
  cargarEstadoDocumentoSoporte() {
    console.log('🔍 Cargando estado del documento de soporte para procedimiento:', this.procedimientoId);
    this.documentoSoporteService.getPorProcedimiento(this.procedimientoId).subscribe({
      next: (doc: any) => {
        console.log('📦 Documento recibido del backend:', doc);
        if (doc) {
          this.documentoId = doc.id;

          // Cargar el estado de actividades completadas
          if (doc.actividades_completadas) {
            this.actividadesDocumentoSoporte = [
              doc.actividades_completadas.formulario,
              doc.actividades_completadas.reglamentoBase,
              doc.actividades_completadas.diagramaFlujo
            ];
            console.log('📥 Actividades cargadas:', this.actividadesDocumentoSoporte);
            console.log('📥 Detalle - formulario:', doc.actividades_completadas.formulario);
            console.log('📥 Detalle - reglamentoBase:', doc.actividades_completadas.reglamentoBase);
            console.log('📥 Detalle - diagramaFlujo:', doc.actividades_completadas.diagramaFlujo);
          } else {
            console.log('⚠️ No hay actividades_completadas en el documento');
            this.actividadesDocumentoSoporte = [false, false, false];
          }

          // Verificar si el documento está completado
          if (doc.documento_completado) {
            this.estadoCompletos[0] = true;
            console.log('✅ Estado inicial: Documento de soporte completado');
          } else {
            this.estadoCompletos[0] = false;
            console.log('⏳ Documento de soporte en progreso');
          }
          console.log('📊 Estado final - estadoCompletos:', this.estadoCompletos);
          console.log('📊 Estado final - actividadesDocumentoSoporte:', this.actividadesDocumentoSoporte);
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        console.log('ℹ️ No existe documento de soporte aún', err);
        this.estadoCompletos[0] = false;
        this.actividadesDocumentoSoporte = [false, false, false];
      }
    });
  }

  actualizarChecklistDocumentoSoporte(estados: boolean[]) {
    console.log('🔄 Estandarizar recibió estados:', estados);
    console.log('📋 Estados anteriores:', this.actividadesDocumentoSoporte);
    this.actividadesDocumentoSoporte = [...estados];
    console.log('✅ Estados actualizados:', this.actividadesDocumentoSoporte);
    this.cd.detectChanges();
  }

  // Nuevo método para manejar hover
  onHoverState(index: number) {
    this.hoverIndex = index;
    // Si es el estado 0 (Documento de soporte), recargar desde backend
    if (index === 0) {
      this.documentoSoporteService.getPorProcedimiento(this.procedimientoId).subscribe({
        next: (doc: any) => {
          if (doc && doc.actividades_completadas) {
            this.actividadesDocumentoSoporte = [
              doc.actividades_completadas.formulario,
              doc.actividades_completadas.reglamentoBase,
              doc.actividades_completadas.diagramaFlujo
            ];
            console.log('🔄 Actividades recargadas en hover:', this.actividadesDocumentoSoporte);
            this.cd.detectChanges();
          }
        },
        error: (err) => {
          console.log('ℹ️ No se pudo cargar el documento en hover');
        }
      });
    }
    // Si es el estado 1 (Soporte computacional), recargar actividades
    else if (index === 1) {
      this.soporteComputacionalService.getSoporteComputacional(this.procedimientoId).subscribe({
        next: (soporte: any) => {
          if (soporte) {
            // Verificar si el formulario está completo
            let completado = false;
            if (soporte.tiene_soporte === true) {
              completado = !!(soporte.nombre && soporte.descripcion);
            } else if (soporte.tiene_soporte === false) {
              completado = soporte.requiere_soporte !== null && soporte.requiere_soporte !== undefined;
            }
            this.actividadesSoporteComputacional = [completado];
            console.log('🔄 Actividades soporte computacional recargadas en hover:', this.actividadesSoporteComputacional);
            this.cd.detectChanges();
          }
        },
        error: (err) => {
          console.log('ℹ️ No se pudo cargar el soporte computacional en hover', err);
        }
      });
    }
  }

  onEstadoCompleto(event: { index: number; completo: boolean }) {
    this.estadoCompletos[event.index] = event.completo;
    this.cd.detectChanges()
  }

  actualizarChecklistSoporteComputacional(estados: boolean[]) {
    console.log('🔄 Estandarizar recibió estados soporte computacional:', estados);
    console.log('📋 Estados anteriores:', this.actividadesSoporteComputacional);
    this.actividadesSoporteComputacional = [...estados];
    console.log('✅ Estados actualizados:', this.actividadesSoporteComputacional);
    this.cd.detectChanges();
  }

  marcarchecklist(index: number) {
    this.estadoCompletos[index] = true;
    console.log('el estado completo es el', this.estadoCompletos)
    this.alertService.infoExito(`El estado "${this.datosService.estados[index]}" ya se encuentra completado`);
    //  Obtener el procedimiento activo
    const procedimientoId = sessionStorage.getItem('procedimientoActivo');
    if (!procedimientoId) return;
    this.estadoCompletos[index] = true;
    // Recargar el estado del documento para sincronizar con el backend
    if (index === 0) {
      setTimeout(() => this.cargarEstadoDocumentoSoporte(), 300);
    }
  }

  // Helper methods para validaciones en el template
  todosEstadosCompletos(): boolean {
    return this.estadoCompletos.every(estado => estado === true);
  }

  todasActividadesDocumentoSoporteCompletas(): boolean {
    return this.actividadesDocumentoSoporte.every(actividad => actividad === true);
  }

  todasActividadesSoporteComputacionalCompletas(): boolean {
    return this.actividadesSoporteComputacional.every(actividad => actividad === true);
  }

  todasActividadesReglamentoCompletas(): boolean {
    return this.actividadesReglamento.every(actividad => actividad === true);
  }
}
