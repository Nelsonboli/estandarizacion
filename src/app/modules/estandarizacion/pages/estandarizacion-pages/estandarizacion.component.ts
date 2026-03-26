import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '../../../../shared/services/alert.service';
import { DatosService } from '../../../../shared/services/datos.service';
import { DocumentoSoporteService } from '../../services/documento-soporte.service';
import { SoporteComputacionalService } from '../../services/soporte-computacional.service';
import { ReglamentoComponent } from '../../components/estados/reglamento/reglamento.component';
import { InicioComponent } from '../../components/estados/inicio/inicio.component';
import { DocumentacionSoporteComponent } from '../../components/estados/documentacion-soporte/documentacion-soporte.component';
import { SoporteComputacionalComponent } from '../../components/estados/soporte-computacional/soporte-computacional.component';
import { CardActividadesComponent } from '../../components/card-actividades/card-actividades.component';
import { SoporteComputacional } from '../../interfaces/soporte-computacional.interface';
import { DocumentoSoporte } from '../../interfaces/documento-soporte.interface';
import { ReglamentoService } from '../../services/reglamento.service';
import { Reglamento } from '../../interfaces/reglamento.interface';
import { ProcedimientoService } from '../../../identificacion-requerimientos/services/procedimiento.service';
import { Procedimiento } from '../../../identificacion-requerimientos/interfaces/procedimiento.interface';

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
    SoporteComputacionalComponent
  ],
  templateUrl: './estandarizacion.component.html',
  styleUrls: ['./estandarizacion.component.css'],
})

export class EstandarizarComponent {
  //id de estados y procedimiento
  procedimientoId = signal<number>(0);
  soporteId = signal<number>(0);
  documentoId = signal<number>(0);
  reglamentoId = signal<number>(0);

  //Validacion de estado para procedimiento y estados del procedimiento
  estadosCompletados = signal<boolean[]>([false, false, false]);
  actividadesDocumentoSoporte = signal<boolean[]>([false, false, false]);
  actividadesSoporteComputacional = signal<boolean[]>([false]);
  actividadesReglamento = signal<boolean[]>([false, false, false, false]);

  //Index de estados
  hoverIndex = signal<number | null>(null);
  buttonIndex = signal<number | null>(null);

  // validacion para estado imcompleto de procedimiento
  estadoAnterior = signal<boolean>(false);
  nombreprocedimiento = signal<string>('');

  //Servicios e inyeccion de dependencias
  private route = inject(ActivatedRoute);
  private alertService = inject(AlertService);
  public datosService = inject(DatosService);
  private documentoSoporteService = inject(DocumentoSoporteService);
  private soporteComputacionalService = inject(SoporteComputacionalService);
  private reglamentoService = inject(ReglamentoService);
  private procedimientoService = inject(ProcedimientoService);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.procedimientoId.set(id);
    this.cargarEstadoDocumentoSoporte();
    this.cargarEstadoSoporteComputacional();
    this.cargarEstadoReglamento();
    this.datosProcedimiento();
  }

  //llamado a los diferentes estados
  onButtonClick(index: number) {
    console.log('--- Click en botón ---', { index, nombre: this.datosService.estados[index] });
    // Validar que TODOS los estados anteriores estén completos
    const estadosIncompletos = this.estadosCompletados()
      .slice(0, index)
      .map((estado, i) => estado ? null : this.datosService.estados[i])
      .filter(e => e !== null);
    if (estadosIncompletos.length > 0) {
      const mensaje = estadosIncompletos.length === 1
        ? `debe completar el estado ${estadosIncompletos[0]}` :
        `debe completar los estados ${estadosIncompletos.join(' y ')}`
      this.alertService.info(`${mensaje} para pasar al estado ${this.datosService.estados[index]}`);
      return;
    }
    switch (index) {
      case 0:
        this.documentoSoporteService.getPorProcedimiento(this.procedimientoId()).subscribe({
          next: (documentoSoporte: DocumentoSoporte) => {
            console.log('Datos cargados - Documento Soporte:', documentoSoporte);
            if (documentoSoporte) {
              this.procesarDocumentoSoporte(documentoSoporte);
              this.buttonIndex.set(index);
              if (documentoSoporte.documento_completado) {
                this.alertService.infoInformacion(`El estado "${this.datosService.estados[index]}" ya se encuentra completado`);
              }
            } else {
              this.documentoSoporteService.crearDocumento(this.procedimientoId()).subscribe({
                next: (soporteNuevo: DocumentoSoporte) => {
                  console.log('Datos creados - Documento Soporte Nuevo:', soporteNuevo);
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
            console.log('Datos cargados - Soporte Computacional:', soporteComputacional);
            if (soporteComputacional) {
              this.procesarSoporteComputacional(soporteComputacional);
              this.buttonIndex.set(index);
              if (soporteComputacional.computacional_completado) {
                this.alertService.infoInformacion(`El estado "${this.datosService.estados[index]}" ya se encuentra completado`);
              }
            } else {
              this.soporteComputacionalService.crearSoporteComputacional(this.procedimientoId()).subscribe({
                next: (computacionalNuevo: SoporteComputacional) => {
                  console.log('Datos creados - Soporte Computacional Nuevo:', computacionalNuevo);
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
            console.log('Datos cargados - Reglamento:', reglamento);
            if (reglamento) {
              this.procesarReglamento(reglamento);
              this.buttonIndex.set(index);
              if (reglamento.reglamento_completado) {
                this.alertService.infoInformacion(`El estado "${this.datosService.estados[index]}" ya se encuentra completado`);
              }
            } else {
              this.reglamentoService.crearReglamento(this.procedimientoId()).subscribe({
                next: (reglamentoNuevo: Reglamento) => {
                  console.log('Datos creados - Reglamento Nuevo:', reglamentoNuevo);
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



  onHoverState(index: number) {
    if (this.hoverIndex() === index) return;
    console.log('--- Hover en botón ---', { index, nombre: this.datosService.estados[index] });
    this.hoverIndex.set(index);
    if (this.buttonIndex() === index) return;
    if (index === 0 && !this.estadosCompletados()[0]) this.cargarEstadoDocumentoSoporte();
    else if (index === 1 && !this.estadosCompletados()[1]) this.cargarEstadoSoporteComputacional();
    else if (index === 2 && !this.estadosCompletados()[2]) this.cargarEstadoReglamento();
  }

  // Funciones Documento Soporte
  cargarEstadoDocumentoSoporte() {
    this.documentoSoporteService.getPorProcedimiento(this.procedimientoId()).subscribe({
      next: (doc: DocumentoSoporte) => {
        console.log('Datos cargados - Estado Documento Soporte:', doc);
        if (doc) {
          this.procesarDocumentoSoporte(doc);
        } else {
          this.restaurarEstadoDocumentoSoporte();
        }
      },
      error: (err) => {
        console.error('cargarEstadoDocumentoSoporte error', err);
        this.restaurarEstadoDocumentoSoporte();
      }
    });
  }

  private restaurarEstadoDocumentoSoporte() {
    this.estadosCompletados.update(estados => {
      estados[0] = false;
      return [...estados];
    });
    this.actividadesDocumentoSoporte.set([false, false, false]);
  }

  private procesarDocumentoSoporte(doc: DocumentoSoporte) {
    console.log('Procesando Documento Soporte...', doc);
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
    this.estadosCompletados.update(estados => {
      estados[0] = !!doc.documento_completado;
      return [...estados];
    });
    this.estadoCompletado();
  }

  // Funciones Soporte Computacional
  cargarEstadoSoporteComputacional() {
    this.soporteComputacionalService.getSoporteComputacional(this.procedimientoId()).subscribe({
      next: (soporte: SoporteComputacional) => {
        console.log('Datos cargados - Estado Soporte Computacional:', soporte);
        if (soporte) {
          this.procesarSoporteComputacional(soporte);
        } else {
          this.restaurarEstadoSoporteComputacional();
        }
      },
      error: (err) => {
        console.error('cargarSoporteComputacional error', err);
        this.restaurarEstadoSoporteComputacional();
      }
    });
  }

  private restaurarEstadoSoporteComputacional() {
    this.estadosCompletados.update(estados => {
      estados[1] = false;
      return [...estados];
    });
    this.actividadesSoporteComputacional.set([false]);
  }

  private procesarSoporteComputacional(soporte: SoporteComputacional) {
    console.log('Procesando Soporte Computacional...', soporte);
    this.soporteId.set(soporte.id!); // Asignar el ID crucial
    let completado = false;
    if (soporte.tiene_soporte === true) {
      completado = !!(soporte.nombre && soporte.descripcion)
    } else if (soporte.tiene_soporte === false) {
      completado = soporte.requiere_soporte !== null && soporte.requiere_soporte !== undefined;
    }
    this.actividadesSoporteComputacional.set([completado]);
    this.estadosCompletados.update(estados => {
      estados[1] = !!soporte.computacional_completado;
      return [...estados];
    });
    this.estadoCompletado();
  }

  // Funciones Reglamento
  cargarEstadoReglamento() {
    this.reglamentoService.obtenerReglamento(this.procedimientoId()).subscribe({
      next: (reglamento: Reglamento) => {
        console.log('Datos cargados - Estado Reglamento:', reglamento);
        if (reglamento) {
          this.procesarReglamento(reglamento);
        } else {
          this.restaurarEstadoReglamento();
        }
      },
      error: (err) => {
        console.error('cargarReglamento error', err, this.procedimientoId());
        this.restaurarEstadoReglamento();
      }
    });
  }

  private restaurarEstadoReglamento() {
    this.estadosCompletados.update(estados => {
      estados[2] = false;
      return [...estados];
    });
    this.actividadesReglamento.set([false, false, false, false]);
  }

  private procesarReglamento(reglamento: Reglamento) {
    console.log('Procesando Reglamento...', reglamento);
    this.reglamentoId.set(reglamento.id!);
    if (reglamento.actividades_completadas) {
      const acts = reglamento.actividades_completadas as any;
      this.actividadesReglamento.set([
        !!acts.descarga_daac_completada,
        !!acts.subida_daac_completada,
        !!acts.descarga_estandarizacion_completada,
        !!acts.subida_estandarizacion_completada,
      ]);
    } else {
      this.actividadesReglamento.set([false, false, false, false]);
    }
    this.estadosCompletados.update(estados => {
      estados[2] = !!reglamento.reglamento_completado;
      return [...estados];
    });
    this.estadoCompletado();
  }

  actualizarChecklist(index: number, estados: boolean[]) {
    console.log('actualizarChecklist called', { index, estados });
    const todosCompletos = estados.length > 0 && estados.every(e => e === true);
    this.estadoCompletado();
    this.estadosCompletados.update(completos => {
      const nuevosCompletos = [...completos];
      nuevosCompletos[index] = todosCompletos;
      console.log('nuevosCompletos', nuevosCompletos);
      return nuevosCompletos;
    });
    const map = [
      this.actividadesDocumentoSoporte,
      this.actividadesSoporteComputacional,
      this.actividadesReglamento
    ];
    map[index].set([...estados]);
    this.estadoCompletado();
  }

  finalizarEstado(index: number) {
    console.log('finalizarEstado called', { index });
    // Solo marcamos como completado si no lo estaba ya
    if (!this.estadosCompletados()[index]) {
      this.estadosCompletados.update(estados => {
        const nuevosEstados = [...estados];
        nuevosEstados[index] = true;
        return nuevosEstados;
      });
      this.estadoCompletado();
    }
    if (index === 0) {
      setTimeout(() => {
        console.log('Marcado Documento Soporte');
        this.cargarEstadoDocumentoSoporte();
      }, 100);
    } else if (index === 1) {
      setTimeout(() => {
        console.log('Marcado Soporte Computacional');
        this.cargarEstadoSoporteComputacional();
      }, 100);
    } else if (index === 2) {
      setTimeout(() => {
        console.log('Marcado Reglamento');
        this.cargarEstadoReglamento();
      }, 100);
    }
  }

  estadoCompletado() {
    const todosCompletos = this.estadosCompletados().every(e => e === true);
    console.log('estadoCompletos para alerta', todosCompletos, 'estadoAnterior:', this.estadoAnterior());
    if (!todosCompletos) {
      this.estadoAnterior.set(true);
    } else if (todosCompletos && this.estadoAnterior()) {
      this.estadoAnterior.set(false);
      setTimeout(() => {
        this.alertService.exito(`El procedimiento " ${this.nombreprocedimiento()}" esta Completo`);
      }, 300);
    }
  }

  datosProcedimiento() {
    this.procedimientoService.getProcedimiento(this.procedimientoId()).subscribe({
      next: (procedimiento: Procedimiento) => {
        console.log('Datos cargados - Procedimiento (datos):', procedimiento);
        this.nombreprocedimiento.set(procedimiento.procedimiento);
      },
      error: (err) => {
        console.error('Error al obtener el procedimiento', err);
        this.alertService.error('Error al obtener el procedimiento');
      }
    });
  }
}
