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
  })

  constructor() {
    effect(() => {
      const currentReglamentoId = this.reglamentoId();
      if (currentReglamentoId) {
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

  guardarDocumentoDAAC(file: File) {
    if (this.subidaActiva === 'subirProcedimiento') {
      this.subirFormatoDAAC(file);
    }
    this.subidaActiva = null;
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

  descargarFormatoEstandarizacion() {
    const procedimientoId = this.procedimientoId();
    if (!procedimientoId) {
      this.alertService.error('No se ha seleccionado un procedimiento para descargar el reporte.');
      return;
    }
    let nombreArchivo = 'Formato_Estandarizacion.pdf';
    let nombreProcedimiento = 'Procedimiento';

    this.procedimientoService.getProcedimiento(procedimientoId).pipe(
      tap(data => {
        nombreProcedimiento = data.procedimiento || 'Procedimiento';
        nombreArchivo = `Formato_Estandarizacion_${nombreProcedimiento.replace(/ /g, '_')}.pdf`;
      }),
      switchMap(() => this.procedimientoService.descargarFormatoEstandarizacion(procedimientoId))
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
      },
      error: (error) => {
        console.error('Error en el proceso de descarga:', error);
        this.alertService.error('Error al descargar el reporte. Por favor intente nuevamente.');
      }
    });
  }

  formatoDAACCompletado() {
    const { subida_daac_completada, descarga_daac_completada } = this.estadoReglamento();
    if (!subida_daac_completada && !descarga_daac_completada) {
      this.alertService.info('Debe descargar y subir el formato DAAC para descargar el formato de estandarización');
      return false;
    }
    if (!subida_daac_completada) {
      this.alertService.info('Debe subir el formato DAAC para descargar el formato de estandarización');
      return false;
    }
    if (!descarga_daac_completada) {
      this.alertService.info('Debe descargar el formato DAAC para descargar el formato de estandarización');
      return false;
    }
    return true;
  }

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
      estado.subida_daac_completada;
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
    console.log("reglamento_completado", todascompletas);
  }

  cerrarDocumento() {
    this.subidaActiva = null;
  }

  obtenerArchivoSeleccionado(event: documentoSubido) {
    this.selectedFile.set(event.file);
    this.selectedFileName.set(event.fileName);
    this.filePreviewUrl.set(event.previewUrl);
  }

}




