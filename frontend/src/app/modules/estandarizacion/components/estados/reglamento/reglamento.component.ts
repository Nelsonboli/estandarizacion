import { ChangeDetectorRef, Component, DestroyRef, OnInit, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubirArchivoComponent } from '../../subir-archivo/subir-archivo.component';
import { CardDocumentoComponent } from '../../card-documento/card-documento.component';
import { FormatoEstandarizacionComponent } from '../../formato-estandarizacion/formato-estandarizacion.component';
import { ProcedimientoService } from '../../../../identificacion-requerimientos/services/procedimiento.service';
import { AlertService } from '../../../../../shared/services/alert.service';
import { switchMap, tap } from 'rxjs';
import { ReglamentoService } from '../../../services/reglamento.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { actividadesReglamento, documentoSubido } from '../../../interfaces/reglamento.interface';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'app-reglamento',
  imports: [ReactiveFormsModule, SubirArchivoComponent, FormatoEstandarizacionComponent, CardDocumentoComponent],
  templateUrl: './reglamento.component.html',
  styleUrl: './reglamento.component.css'
})
export class ReglamentoComponent implements OnInit {
  descargaActiva: 'descargarProcedimiento' | 'descargarEstandarizacion' | null = null;
  subidaActiva: 'subirProcedimiento' | 'subirEstandarizacion' | null = null;
  formatoEstandarizacion = "Formato de Estandarizacion"
  fichaProcedimiento = "Ficha de Procedimiento"
  procedimientoId = input<number>();
  reglamentoEnviado = output<void>();
  cambioEstadoActividades = output<boolean[]>();
  reglamentoId = input<number>();
  form!: FormGroup;
  subiendo = signal(false);
  selectedFile = signal<File | null>(null);

  //servicios e inyecciones de dependencias
  private procedimientoService = inject(ProcedimientoService);
  private fb = inject(FormBuilder);
  private alertService = inject(AlertService);
  private reglamentoService = inject(ReglamentoService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  selectedFileName = signal<string | null>(null);
  filePreviewUrl = signal<SafeResourceUrl | null>(null);

  estadoReglamento = signal<actividadesReglamento>({
    subida_daac_completada: false,
    descarga_daac_completada: false,
    subida_estandarizacion_completada: false,
    descarga_estandarizacion_completada: false
  })

  constructor() {
    effect(() => {
      const currentReglamentoId = this.reglamentoId();
      if (currentReglamentoId) {
        // Verificar actividades cuando cambie el soporteId
        this.verificarActividadesReglamento();
        console.log('Reglamento ID:', this.reglamentoId());
      }
    });
  }

  ngOnInit() {
    this.form = this.fb.group({
      respuesta1: ['', Validators.required],
      detalle1: [''],
    });

  }

  onSubmit() {
    // TODO: Implementar lógica de envío si es necesario
  }

  subirFormatoDAAC(file: File) {
    const regId = this.reglamentoId();
    if (!regId) return;
    this.subiendo.set(true);
    this.reglamentoService.subirFormatoDAAC(regId, file)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => this.subiendo.set(false))
      )
      .subscribe({
        next: () => {
          this.alertService.exito('Formato de caracterizacion DAAC subido correctamente');
          this.verificarActividadesReglamento();
          console.log(this.subiendo());
        },
        error: () => {
          this.alertService.error('Error al subir el formato de caracterizacion DAAC');
        }
      });
  }

  subirFormatoEstandarizacion(file: File) {
    const regId = this.reglamentoId();
    if (!regId) return;
    this.subiendo.set(true);
    this.reglamentoService.subirFormatoEstandarizacion(regId, file)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => this.subiendo.set(false))
      )
      .subscribe({
        next: () => {
          this.alertService.exito('Archivo de estandarización subido correctamente');
          this.verificarActividadesReglamento();
          console.log(this.subiendo());
        },
        error: () => {
          this.alertService.error('Error al subir el archivo de estandarización');
        }
      });
  }

  eliminarFormatoDAAC() {
    const regId = this.reglamentoId();
    if (!regId) return;
    this.alertService.confirmar('¿Está seguro de eliminar el formato de caracterizacion DAAC?', 'Esta acción no se puede deshacer').then((result) => {
      if (result.isConfirmed) {
        this.reglamentoService.eliminarFormatoDAAC(regId).subscribe({
          next: () => {
            this.alertService.exito('Formato de caracterizacion DAAC eliminado correctamente');
            this.verificarActividadesReglamento();
          },
          error: (error) => {
            console.error('Error al eliminar formato de caracterizacion DAAC:', error);
            this.alertService.error('Error al eliminar el formato de caracterizacion DAAC. Por favor intente nuevamente.');
          }
        });
      }
    });
  }

  eliminarFormatoEstandarizacion() {
    const regId = this.reglamentoId();
    if (!regId) return;
    this.alertService.confirmar('¿Está seguro de eliminar el formato de estandarización?', 'Esta acción no se puede deshacer').then((result) => {
      if (result.isConfirmed) {
        this.reglamentoService.eliminarFormatoEstandarizacion(regId).subscribe({
          next: () => {
            this.alertService.exito('Formato de estandarización eliminado correctamente');
            this.verificarActividadesReglamento();
          },
          error: (error) => {
            console.error('Error al eliminar formato de estandarización:', error);
            this.alertService.error('Error al eliminar el formato de estandarización. Por favor intente nuevamente.');
          }
        });
      }
    });
  }

  descargarReporteDAAC() {
    const pId = this.procedimientoId();
    if (!pId) {
      this.alertService.error('No se ha seleccionado un procedimiento para descargar el reporte.');
      return;
    }
    let nombreArchivo = 'Reporte_DAAC.pdf';
    let nombreProcedimiento = 'Procedimiento';

    this.procedimientoService.getProcedimiento(pId).pipe(
      tap(data => {
        nombreProcedimiento = data.procedimiento || 'Procedimiento';
        nombreArchivo = `Reporte_DAAC_${nombreProcedimiento.replace(/ /g, '_')}.pdf`;
      }),
      switchMap(() => this.procedimientoService.descargarReporte(pId))
    ).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Actualizar el estado en el backend con el nombre del procedimiento
        const regId = this.reglamentoId();
        if (regId) {
          this.reglamentoService.marcarDescargaFormatoDAAC(regId, nombreProcedimiento).subscribe({
            next: () => {
              console.log('Reglamento marcado como descargado');
              this.verificarActividadesReglamento();
            },
            error: (err) => console.error('Error al marcar como descargado:', err)
          });
        }
      },
      complete: () => {
        this.verificarActividadesReglamento();
      },
      error: (error) => {
        console.error('Error en el proceso de descarga:', error);
        this.alertService.error('Error al descargar el reporte. Por favor intente nuevamente.');
      }
    });
  }

  //METODOS PARA LA DESCARGA DEL REPORTE DE LA FICHA DE PROCEDIMIENTO
  verificarActividadesReglamento() {
    const procId = this.procedimientoId();
    if (!procId) return;
    this.reglamentoService.obtenerReglamento(procId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reglamento) => {
          if (!reglamento.actividades_completadas) return;
          const estado = reglamento.actividades_completadas as any;
          this.estadoReglamento.set(estado);
          this.cambioEstadoActividades.emit([
            !!estado.descarga_daac_completada,
            !!estado.subida_daac_completada,
            !!estado.descarga_estandarizacion_completada,
            !!estado.subida_estandarizacion_completada
          ]);
          if (reglamento.reglamento_completado) {
            this.reglamentoEnviado.emit();
          }
        },
        error: () => this.alertService.error('Error al obtener reglamento')
      });
  }
  actualizarActividadesReglamento(estado: actividadesReglamento) {
    const todascompletas =
      estado.descarga_daac_completada &&
      estado.subida_daac_completada &&
      estado.descarga_estandarizacion_completada &&
      estado.subida_estandarizacion_completada;

    this.reglamentoService.actualizarReglamento(this.reglamentoId()!, {
      actividades_completadas: estado,
      reglamento_completado: todascompletas
    }).subscribe({
      next: () => {
        if (todascompletas) {
          this.reglamentoEnviado.emit();
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        console.error('Error al actualizar actividades del reglamento:', error);
        this.alertService.error('Error al actualizar actividades del reglamento. Por favor intente nuevamente.');
      }
    });
  }

  descargarFormatoEstandarizacion(formatoRef: any) {
    formatoRef.generarPDF();
    const regId = this.reglamentoId();
    if (regId) {
      this.reglamentoService.marcarDescargaFormatoEstandarizacion(regId, 'Formato_Estandarizacion.pdf').subscribe({
        next: () => {
          console.log('Formato de estandarización marcado como descargado');
          this.verificarActividadesReglamento();
        },
        error: (err) => console.error('Error al marcar formato como descargado:', err)
      });
    }
  }

  cerrarDocumento() {
    this.subidaActiva = null;
  }

  guardarDocumentoDAAC(file: File) {
    if (this.subidaActiva === 'subirProcedimiento') {
      this.subirFormatoDAAC(file);
    } else if (this.subidaActiva === 'subirEstandarizacion') {
      this.subirFormatoEstandarizacion(file);
    }
    this.subidaActiva = null;
  }

  obtenerArchivoSeleccionado(event: documentoSubido) {
    this.selectedFile.set(event.file);
    this.selectedFileName.set(event.fileName);
    this.filePreviewUrl.set(event.previewUrl);
  }

}


