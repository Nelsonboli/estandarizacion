import { Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../../shared/services/alert.service';
import { DatosService } from '../../../../shared/services/datos.service';
import { DocumentoSoporteService } from '../../services/documento-soporte.service';
import { SoporteComputacionalService } from '../../services/soporte-computacional.service';
import { ReglamentoComponent } from '../../components/criterios/reglamento/reglamento.component';
import { InicioComponent } from '../../components/criterios/inicio/inicio.component';
import { DocumentacionSoporteComponent } from '../../components/criterios/documentacion-soporte/documentacion-soporte.component';
import { SoporteComputacionalComponent } from '../../components/criterios/soporte-computacional/soporte-computacional.component';
import { CardActividadesComponent } from '../../components/card-actividades/card-actividades.component';
import { SoporteComputacional } from '../../interfaces/soporte-computacional.interface';
import { DocumentoSoporte } from '../../interfaces/documento-soporte.interface';
import { ReglamentoService } from '../../services/reglamento.service';
import { Reglamento } from '../../interfaces/reglamento.interface';
import { ProcedimientoService } from '../../../identificacion-requerimientos/services/procedimiento.service';
import { Procedimiento } from '../../../identificacion-requerimientos/interfaces/procedimiento.interface';
import { NavegacionComponent } from '../../../../shared/components/navegacion/navegacion';
import { EstadolistaService } from '../../../../shared/services/estado-lista.service';
import { RecoleccionInformacionService } from '../../services/recoleccion-informacion.service';
import { ModalRecoleccionInformacionComponent } from '../../../../shared/components/modal-recoleccion-informacion/modal-recoleccion-informacion.component';
import { EstadoAsignacionService } from '../../../../shared/services/estado-asignacion.service';

@Component({
  standalone: true,
  selector: 'app-estandarizar',
  imports: [
    CardActividadesComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReglamentoComponent,
    InicioComponent,
    DocumentacionSoporteComponent,
    SoporteComputacionalComponent,
    NavegacionComponent,
    ModalRecoleccionInformacionComponent
  ],
  templateUrl: './estandarizacion.component.html',
  styleUrls: ['./estandarizacion.component.css'],
})

export class EstandarizarComponent {
  @ViewChild('inicioComp') inicioComp?: InicioComponent;
  //id de criterio y procedimiento
  procedimientoId = signal<number>(0);
  soporteId = signal<number>(0);
  documentoId = signal<number>(0);
  reglamentoId = signal<number>(0);

  //Validacion de criterio para procedimiento y criterio del procedimiento
  criteriosCompletados = signal<boolean[]>([false, false, false]);
  actividadesDocumentoSoporte = signal<boolean[]>([false, false, false]);
  actividadesSoporteComputacional = signal<boolean[]>([false]);
  actividadesReglamento = signal<boolean[]>([false, false]);

  //Index de criterios
  hoverIndex = signal<number | null>(null);
  buttonIndex = signal<number | null>(null);

  // validacion para criterio imcompleto de procedimiento
  criterioAnterior = signal<boolean>(false);
  nombreProcedimiento = signal<string>('');

  //Servicios e inyeccion de dependencias
  private listaService = inject(EstadolistaService)
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertService = inject(AlertService);
  public datosService = inject(DatosService);
  private documentoSoporteService = inject(DocumentoSoporteService);
  private soporteComputacionalService = inject(SoporteComputacionalService);
  private reglamentoService = inject(ReglamentoService);
  private procedimientoService = inject(ProcedimientoService);
  private recoleccionService = inject(RecoleccionInformacionService);
  private estadoAsignacionService = inject(EstadoAsignacionService);

  mostrarModalRecoleccion = signal(false);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.procedimientoId.set(id);
    this.cargarCriterioDocumentoSoporte();
    this.cargarCriterioSoporteComputacional();
    this.cargarCriterioReglamento();
    this.datosProcedimiento();
    this.verificarRecoleccion();
  }

  //llamado a los diferentes c
  onButtonClick(index: number) {
    // Validar que TODOS los criterios anteriores estén completos
    const criteriosIncompletos = this.criteriosCompletados()
      .slice(0, index)
      .map((criterio, i) => criterio ? null : this.datosService.criterios[i])
      .filter(e => e !== null);
    if (criteriosIncompletos.length > 0) {
      const mensaje = criteriosIncompletos.length === 1
        ? `debe completar el criterio ${criteriosIncompletos[0]}` :
        `debe completar los criterios ${criteriosIncompletos.join(' y ')}`
      this.alertService.info(`${mensaje} para pasar al criterio ${this.datosService.criterios[index]}`);
      return;
    }
    switch (index) {
      case 0:
        this.documentoSoporteService.getPorProcedimiento(this.procedimientoId()).subscribe({
          next: (documentoSoporte: DocumentoSoporte) => {
            if (documentoSoporte) {
              this.procesarDocumentoSoporte(documentoSoporte);
              this.buttonIndex.set(index);
              if (documentoSoporte.documento_completado) {
                this.alertService.infoInformacion(`El criterio "${this.datosService.criterios[index]}" ya se encuentra completado`);
              }
            } else {
              this.documentoSoporteService.crearDocumento(this.procedimientoId()).subscribe({
                next: (soporteNuevo: DocumentoSoporte) => {
                  this.procesarDocumentoSoporte(soporteNuevo);
                  this.buttonIndex.set(index);
                },
                error: (err) => {
                  console.error('Error al crear el documento de soporte', err);
                  this.alertService.error('Error al crear el documento de soporte');
                }
              });
            }
          },
          error: (err) => {
            console.error('Error al obtener el documento de soporte', err);
            this.alertService.error('Error al obtener el documento de soporte');
          }
        });
        break;
      case 1:
        this.soporteComputacionalService.getSoporteComputacional(this.procedimientoId()).subscribe({
          next: (soporteComputacional: SoporteComputacional) => {
            if (soporteComputacional) {
              this.procesarSoporteComputacional(soporteComputacional);
              this.buttonIndex.set(index);
              if (soporteComputacional.computacional_completado) {
                this.alertService.infoInformacion(`El criterio "${this.datosService.criterios[index]}" ya se encuentra completado`);
              }
            } else {
              this.soporteComputacionalService.crearSoporteComputacional(this.procedimientoId()).subscribe({
                next: (computacionalNuevo: SoporteComputacional) => {
                  this.procesarSoporteComputacional(computacionalNuevo);
                  this.buttonIndex.set(index);
                },
                error: (err) => {
                  console.error('Error al crear el soporte computacional', err);
                  this.alertService.error('Error al crear el soporte computacional');
                }
              });
            }
          },
          error: (err) => {
            console.error('Error al obtener el soporte computacional', err);
            this.alertService.error('Error al obtener el soporte computacional');
          }
        });
        break;
      case 2:
        this.reglamentoService.obtenerReglamento(this.procedimientoId()).subscribe({
          next: (reglamento: Reglamento) => {
            if (reglamento) {
              this.procesarReglamento(reglamento);
              this.buttonIndex.set(index);
              if (reglamento.reglamento_completado) {
                this.alertService.infoInformacion(`El criterio "${this.datosService.criterios[index]}" ya se encuentra completado`);
              }
            } else {
              this.reglamentoService.crearReglamento(this.procedimientoId()).subscribe({
                next: (reglamentoNuevo: Reglamento) => {
                  this.procesarReglamento(reglamentoNuevo);
                  this.buttonIndex.set(index);
                },
                error: (err) => {
                  console.error('Error al crear el reglamento', err);
                  this.alertService.error('Error al crear el reglamento');
                }
              });
            }
          },
          error: (err) => {
            console.error('Error al obtener el reglamento', err);
            this.alertService.error('Error al obtener el reglamento');
          }
        });
        break;
    }

  }

  navegarAnterior() {
    const index = this.buttonIndex();
    if (index === null) {
      this.router.navigate(['/identificacionrequerimientos']);
    } else if (index === 0) {
      this.buttonIndex.set(null);
    } else {
      this.onButtonClick(index - 1);
    }
  }

  navegarSiguiente() {
    const index = this.buttonIndex();
    if (index === null) {
      this.onButtonClick(0);
    } else if (index !== null && index < this.datosService.criterios.length - 1) {
      if (this.criteriosCompletados()[index]) {
        this.onButtonClick(index + 1);
      } else {
        this.alertService.infoInformacion(`Debe completar el criterio "${this.datosService.criterios[index]}" para continuar`);
      }
    } else if (index === this.datosService.criterios.length - 1) {
      if (this.criteriosCompletados()[index]) {
        this.alertService.exito('El procedimiento ha sido completado, puede pasar a la socialización').then((result) => {
          if (result.isConfirmed) {
            this.listaService.abrir();
            this.router.navigate(['/socializacionprocedimientos']);
          }
        });
      } else {
        this.alertService.infoInformacion(`Debe completar el último criterio para finalizar`);
      }
    }
  }

  onHoverState(index: number) {
    if (this.hoverIndex() === index) return;
    this.hoverIndex.set(index);
    if (this.buttonIndex() === index) return;
    if (index === 0 && !this.criteriosCompletados()[0]) this.cargarCriterioDocumentoSoporte();
    else if (index === 1 && !this.criteriosCompletados()[1]) this.cargarCriterioSoporteComputacional();
    else if (index === 2 && !this.criteriosCompletados()[2]) this.cargarCriterioReglamento();
  }

  // Funciones Documento Soporte
  cargarCriterioDocumentoSoporte() {
    this.documentoSoporteService.getPorProcedimiento(this.procedimientoId()).subscribe({
      next: (doc: DocumentoSoporte) => {
        if (doc) {
          this.procesarDocumentoSoporte(doc);
        } else {
          this.restaurarCriterioDocumentoSoporte();
        }
      },
      error: (err) => {
        console.error('cargarCriterioDocumentoSoporte error', err);
        this.restaurarCriterioDocumentoSoporte();
      }
    });
  }

  private restaurarCriterioDocumentoSoporte() {
    this.criteriosCompletados.update(criterios => {
      criterios[0] = false;
      return [...criterios];
    });
    this.actividadesDocumentoSoporte.set([false, false, false]);
  }

  private procesarDocumentoSoporte(doc: DocumentoSoporte) {
    this.documentoId.set(doc.id);
    if (doc.actividades_completadas) {
      this.actividadesDocumentoSoporte.set([
        doc.actividades_completadas.reglamentoBase,
        doc.actividades_completadas.formulario,
        doc.actividades_completadas.diagramaFlujo
      ]);
    } else {
      this.actividadesDocumentoSoporte.set([false, false, false]);
    }
    this.criteriosCompletados.update(criterios => {
      criterios[0] = !!doc.documento_completado;
      return [...criterios];
    });
    this.criterioCompletado();
  }

  // Funciones Soporte Computacional
  cargarCriterioSoporteComputacional() {
    this.soporteComputacionalService.getSoporteComputacional(this.procedimientoId()).subscribe({
      next: (soporte: SoporteComputacional) => {
        if (soporte) {
          this.procesarSoporteComputacional(soporte);
        } else {
          this.restaurarCriterioSoporteComputacional();
        }
      },
      error: (err) => {
        console.error('cargarCriterioSoporteComputacional error', err);
        this.restaurarCriterioSoporteComputacional();
      }
    });
  }

  private restaurarCriterioSoporteComputacional() {
    this.criteriosCompletados.update(criterios => {
      criterios[1] = false;
      return [...criterios];
    });
    this.actividadesSoporteComputacional.set([false]);
  }

  private procesarSoporteComputacional(soporte: SoporteComputacional) {
    this.soporteId.set(soporte.id!); // Asignar el ID crucial
    let completado = false;
    if (soporte.tiene_soporte === true) {
      completado = !!(soporte.nombre && soporte.descripcion)
    } else if (soporte.tiene_soporte === false) {
      completado = soporte.requiere_soporte !== null && soporte.requiere_soporte !== undefined;
    }
    this.actividadesSoporteComputacional.set([completado]);
    this.criteriosCompletados.update(criterios => {
      criterios[1] = !!soporte.computacional_completado;
      return [...criterios];
    });
    this.criterioCompletado();
  }

  // Funciones Reglamento
  cargarCriterioReglamento() {
    this.reglamentoService.obtenerReglamento(this.procedimientoId()).subscribe({
      next: (reglamento: Reglamento) => {
        if (reglamento) {
          this.procesarReglamento(reglamento);
        } else {
          this.restaurarCriterioReglamento();
        }
      },
      error: (err) => {
        console.error('cargarReglamento error', err, this.procedimientoId());
        this.restaurarCriterioReglamento();
      }
    });
  }

  private restaurarCriterioReglamento() {
    this.criteriosCompletados.update(criterios => {
      criterios[2] = false;
      return [...criterios];
    });
    this.actividadesReglamento.set([false, false]);
  }

  private procesarReglamento(reglamento: Reglamento) {
    this.reglamentoId.set(reglamento.id!);
    if (reglamento.actividades_completadas) {
      const acts = reglamento.actividades_completadas as any;
      this.actividadesReglamento.set([
        !!acts.descarga_daac_completada,
        !!acts.subida_daac_completada,
      ]);
    } else {
      this.actividadesReglamento.set([false, false]);
    }
    this.criteriosCompletados.update(criterios => {
      criterios[2] = !!reglamento.reglamento_completado;
      return [...criterios];
    });
    this.criterioCompletado();
  }

  actualizarChecklist(index: number, criterios: boolean[]) {
    const todosCompletos = criterios.length > 0 && criterios.every(e => e === true);
    this.criterioCompletado();
    this.criteriosCompletados.update(completos => {
      const nuevosCompletos = [...completos];
      nuevosCompletos[index] = todosCompletos;
      return nuevosCompletos;
    });
    const map = [
      this.actividadesDocumentoSoporte,
      this.actividadesSoporteComputacional,
      this.actividadesReglamento
    ];
    map[index].set([...criterios]);
    this.criterioCompletado();
  }

  finalizarCriterio(index: number) {
    // Solo marcamos como completado si no lo estaba ya
    if (!this.criteriosCompletados()[index]) {
      this.criteriosCompletados.update(criterios => {
        const nuevosCriterios = [...criterios];
        nuevosCriterios[index] = true;
        return nuevosCriterios;
      });
      this.criterioCompletado();
    }
    if (index === 0) {
      setTimeout(() => {
        this.cargarCriterioDocumentoSoporte();
      }, 100);
    } else if (index === 1) {
      setTimeout(() => {
        this.cargarCriterioSoporteComputacional();
      }, 100);
    } else if (index === 2) {
      setTimeout(() => {
        this.cargarCriterioReglamento();
      }, 100);
    }
  }

  criterioCompletado() {
    const todosCompletos = this.criteriosCompletados().every(e => e === true);

    // Actualizar el estado en el backend (AsignacionEstado)
    this.estadoAsignacionService.actualizarEstadoProcedimiento(this.procedimientoId(), this.criteriosCompletados()).subscribe({
      error: (err) => console.error('Error al actualizar estado de asignación:', err)
    });

    if (!todosCompletos) {
      this.criterioAnterior.set(true);
    } else if (todosCompletos && this.criterioAnterior()) {
      this.criterioAnterior.set(false);
      setTimeout(() => {
        this.alertService.exito(`El procedimiento "${this.nombreProcedimiento()}" esta Completo`);
      }, 300);
    }
  }

  datosProcedimiento() {
    this.procedimientoService.getProcedimiento(this.procedimientoId()).subscribe({
      next: (procedimiento: Procedimiento) => {
        this.nombreProcedimiento.set(procedimiento.procedimiento);
      },
      error: (err) => {
        console.error('Error al obtener el procedimiento', err);
        this.alertService.error('Error al obtener el procedimiento');
      }
    });
  }

  verificarRecoleccion() {
    if (this.procedimientoId() > 0) {
      this.recoleccionService.getPorProcedimiento(this.procedimientoId()).subscribe({
        next: (res) => {
          // Si no hay encuesta, abrir el modal
          if (!res || (!res.encuesta.trim())) {
            this.abrirModalRecoleccion();
          }
          // Siempre intentar refrescar el componente de inicio si está presente
          this.inicioComp?.obtenerRecoleccionInformacion();
        },
        error: () => {
          this.abrirModalRecoleccion();
          this.inicioComp?.obtenerRecoleccionInformacion();
        }
      });
    }
  }

  abrirModalRecoleccion() {
    this.mostrarModalRecoleccion.set(true);
    document.body.classList.add('overflow-hidden');
  }

  cerrarModalRecoleccion() {
    this.mostrarModalRecoleccion.set(false);
    document.body.classList.remove('overflow-hidden');
  }
}
