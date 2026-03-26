import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatosService } from '../../../../shared/services/datos.service';
import { NavegacionComponent } from '../../../../shared/components/navegacion/navegacion';
import { EstadolistaService } from '../../../../shared/services/estado-lista.service';
import { TablaCriteriosComponent } from '../../../../shared/components/tabla-criterios/tabla-criterios.component';
import { Router } from '@angular/router';
import { FormularioDAACService } from '../../../estandarizacion/services/formulario-daac.service';
import { SoporteComputacionalService } from '../../../estandarizacion/services/soporte-computacional.service';
import { ReglamentoBaseService } from '../../../estandarizacion/services/reglamento-base.service';
import { DocumentoSoporteService } from '../../../estandarizacion/services/documento-soporte.service';
import { TablasFormularioComponent } from "../../../../shared/components/tablas-formulario/tablas-formulario.component";
import { AlertService } from '../../../../shared/services/alert.service';
import { EstadoAsignacionService } from '../../../identificacion-requerimientos/services/estado-asignacion.service';
import { TablaProcedimientoService } from '../../../identificacion-requerimientos/services/tabla-procedimiento.service';
import { ProcedimientoService } from '../../../identificacion-requerimientos/services/procedimiento.service';
import { DiagramaFlujoService } from '../../../estandarizacion/services/diagrama-flujo.service';
import { ListaDesplegableComponent } from '../../components/lista-desplegable/lista-desplegable.component';
import { Procedimiento } from '../../../identificacion-requerimientos/interfaces/procedimiento.interface';
import { Criterios } from '../../../../shared/interfaces/tablas.interface';
import { ReglamentoBase } from '../../../estandarizacion/interfaces/documento-soporte.interface';
import { SocializacionService } from '../../../estandarizacion/services/socializacion.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMaterialTimepickerModule, NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { socializacion } from '../../../estandarizacion/interfaces/socializacion.interface';
import { SoporteComputacional } from '../../../estandarizacion/interfaces/soporte-computacional.interface';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-socializacionprocedimientos',
  imports: [ReactiveFormsModule, CommonModule,
    NavegacionComponent, ListaDesplegableComponent, TablaCriteriosComponent, TablasFormularioComponent,
    MatDatepickerModule, MatInputModule, MatFormFieldModule, MatNativeDateModule, NgxMaterialTimepickerModule, MatIconModule],
  templateUrl: './socializacion-procedimientos.component.html',
  styleUrl: './socializacion-procedimientos.component.css',
})

export class SocializacionprocedimientosComponent implements OnInit {

  darkBlueTheme: NgxMaterialTimepickerTheme = {
    container: {
      bodyBackgroundColor: '#ffffff',
      buttonColor: '#0d47a1'
    },
    dial: {
      dialBackgroundColor: '#0d47a1',
    },
    clockFace: {
      clockFaceBackgroundColor: '#f0f0f0',
      clockHandColor: '#0d47a1',
      clockFaceTimeInactiveColor: '#000000'
    }
  };

  public procedimientos: Procedimiento[] = [];
  public estaAbierto = signal<boolean>(false);
  public procedimientoSeleccionado: Procedimiento | null = null;
  public datosProcedimiento: Criterios[] = [];
  public imagenDiagrama: string | null = null;
  public documentosBase: ReglamentoBase[] = [];
  public soporteComputacional: SoporteComputacional | null = null;
  public formularioDAAC: Criterios[] = [];
  public fechaSignal = signal<Date>(new Date());
  public lugarSignal = signal<string>('');
  public horaSignal = signal<Date>(new Date());
  public socializacionData = signal<socializacion | null>(null);
  public estaSocializado = signal<boolean>(false);

  // Datos para la fecha y hora de socialización
  private readonly fechaActualDia = new Date().getDay();
  public readonly minDate = new Date(this.fechaActualDia);
  public socializacionForm!: FormGroup;

  // Servicios e inyecciones de dependencias 
  public readonly datosTablaService = inject(DatosService);
  public readonly tablaService = inject(TablaProcedimientoService);
  public readonly listaService = inject(EstadolistaService);
  public readonly procedimientoService = inject(ProcedimientoService);
  public readonly reglamentoBaseService = inject(ReglamentoBaseService);
  public readonly formularioDAACService = inject(FormularioDAACService);
  private readonly soporteComputacionalService = inject(SoporteComputacionalService);
  private readonly documentoSoporteService = inject(DocumentoSoporteService);
  private readonly diagramaFlujoService = inject(DiagramaFlujoService);
  public readonly alertService = inject(AlertService);
  private readonly estadoAsignacionService = inject(EstadoAsignacionService);
  public readonly socializacionService = inject(SocializacionService);
  public readonly router = inject(Router);

  ngOnInit(): void {
    this.inicializarFormulario();
    this.obtenerProcedimientos();
    this.listaService.visible$.subscribe(valor => {
      this.estaAbierto.set(valor);
    });
  }

  private inicializarFormulario(): void {
    this.socializacionForm = new FormGroup({
      fecha: new FormControl<Date | null>(null, Validators.required),
      hora: new FormControl<string>('', Validators.required),
      lugar: new FormControl<string>('', Validators.required)
    });
  }

  public obtenerProcedimientos(): void {
    this.procedimientoService.getProcedimientos().subscribe({
      next: (data: Procedimiento[]) => {
        console.log('Datos cargados - Procedimientos:', data);
        this.procedimientos = data;
        this.tablaService.setProcedimientos(data);
      },
      error: (err) => {
        console.error('Error al obtener los procedimientos:', err);
      }
    });
  }

  ObtenerProcedimientos() {
    this.procedimientoService.getProcedimientos().subscribe({
      next: (data) => {
        this.procedimientos = data;
        console.log(this.procedimientos);
        this.tablaService.setProcedimientos(data);
      },
      error: (err) => {
        console.error('Error al obtener los procedimientos:', err);
      }
    });
  }

  public abrirListaSocializacion(): void {
    this.listaService.abrir();
  }

  public cerrarModal(): void {
    this.estaAbierto.set(false);
    this.listaService.cerrar();
  }

  public registrarSocializacion(): void {
    if (this.socializacionForm.invalid) {
      this.socializacionForm.markAllAsTouched();
      this.alertService.error('Por favor complete todos los campos');
      return;
    }

    const { fecha, hora, lugar } = this.socializacionForm.value;
    const horaFinal = this.parsearHora(hora);
    const procedimientoId = this.procedimientoSeleccionado?.id;

    if (!procedimientoId) {
      this.alertService.error('No hay un procedimiento seleccionado');
      return;
    }
    const data: socializacion = {
      fecha,
      lugar,
      hora: horaFinal,
      procedimiento_id: procedimientoId
    };

    const idExistente = this.socializacionData()?.id;

    if (idExistente) {
      this.socializacionService.actualizarSocializacion(idExistente, data).subscribe({
        next: (res: socializacion) => {
          console.log('Datos actualizados - Socialización:', res);
          this.procesarExitoSocializacion(res, data, 'Socialización actualizada exitosamente');
        },
        error: (err) => {
          console.error('Error al actualizar socialización:', err);
          this.alertService.error('Hubo un error al actualizar la socialización');
        }
      });
    } else {
      this.socializacionService.guardarSocializacion(data).subscribe({
        next: (res: socializacion) => {
          console.log('Datos guardados - Socialización:', res);
          this.procesarExitoSocializacion(res, data, 'Socialización registrada exitosamente');
        },
        error: (err) => {
          console.error('Error al registrar:', err);
          this.alertService.error('Hubo un error al registrar la socialización');
        }
      });
    }
  }

  private parsearHora(hora: any): Date {
    let horaFinal = new Date();
    if (typeof hora === 'string') {
      const es12h = hora.toLowerCase().includes('am') || hora.toLowerCase().includes('pm');
      if (es12h) {
        const [hh_mm, periodo] = hora.split(' ');
        let [hh, mm] = hh_mm.split(':').map(Number);
        if (periodo.toUpperCase() === 'PM' && hh < 12) hh += 12;
        if (periodo.toUpperCase() === 'AM' && hh === 12) hh = 0;
        horaFinal.setHours(hh, mm, 0);
      } else {
        const [hh, mm] = hora.split(':').map(Number);
        horaFinal.setHours(hh, mm, 0);
      }
    } else {
      horaFinal = hora;
    }
    return horaFinal;
  }

  private procesarExitoSocializacion(res: socializacion, data: socializacion, mensaje: string): void {
    this.estaSocializado.set(true);
    this.socializacionData.set(res);
    this.fechaSignal.set(data.fecha);
    this.lugarSignal.set(data.lugar);
    this.horaSignal.set(data.hora);
    this.alertService.infoExito(mensaje);
  }

  public eliminarSocializacion(): void {
    const idSocializacion = this.socializacionData()?.id;
    if (!idSocializacion) return;

    this.alertService.alertEliminar().then((res) => {
      if (res.isConfirmed) {
        this.socializacionService.eliminarSocializacion(idSocializacion).subscribe({
          next: () => {
            this.estaSocializado.set(false);
            this.socializacionData.set(null);
            this.socializacionForm.reset();
            this.fechaSignal.set(new Date());
            this.lugarSignal.set('');
            this.horaSignal.set(new Date());
            this.alertService.infoExito('Socialización eliminada exitosamente');
          },
          error: (err) => {
            console.error('Error al eliminar:', err);
            this.alertService.error('No se pudo eliminar la socialización');
          }
        });
      }
    });
  }
  public seleccionarProcedimiento(procedimiento: Procedimiento): void {
    const id = procedimiento.id;
    if (!id) {
      this.alertService.error('No se pudo identificar el procedimiento');
      return;
    }

    this.estadoAsignacionService.obtenerCompletitud(id).subscribe({
      next: (estadoAsignacion) => {
        const estadoLower = estadoAsignacion.estado.toLowerCase();
        if (estadoLower === 'completo') {
          this.procedimientoSeleccionado = procedimiento;
          this.mapearDatosProcedimiento(procedimiento);
          this.cargarDatosAdicionalesProcedimiento(id);
          this.cargarSocializacion(id);
          this.cerrarModal();
          this.alertService.infoExito('Procedimiento Seleccionado');
        } else {
          this.alertService.error(`El procedimiento seleccionado está en estado "${estadoAsignacion.estado}", para socializarlo debe estar en estado "Completo"`).then(() => {
            this.router.navigate(['/identificacionrequerimientos']);
          });
        }
      },
      error: () => this.alertService.error('Error al validar el estado del procedimiento')
    });
  }

  private mapearDatosProcedimiento(procedimiento: Procedimiento): void {
    const excluidos = ['id', 'roles', 'actividades', 'referencias'];
    this.datosProcedimiento = Object.entries(procedimiento)
      .filter(([key, value]) => !excluidos.includes(key.toLowerCase()) && typeof value !== 'object')
      .map(([key, value]) => ({
        Criterio: key.toUpperCase(),
        Descripcion: String(value)
      }));
  }

  public cargarSocializacion(idProcedimiento: number): void {
    this.socializacionService.obtenerPorProcedimiento(idProcedimiento).subscribe({
      next: (data: socializacion | null) => {
        console.log('Datos cargados - Socialización del procedimiento:', data);
        if (data) {
          this.socializacionData.set(data);
          this.estaSocializado.set(true);

          const fechaParsed = new Date(data.fecha);
          this.fechaSignal.set(fechaParsed);
          this.lugarSignal.set(data.lugar || '');

          if (typeof data.hora === 'string') {
            const [h, m] = (data.hora as string).split(':');
            const d = new Date();
            d.setHours(+h, +m, 0);
            this.horaSignal.set(d);
          } else {
            this.horaSignal.set(data.hora);
          }

          const hStr = data.hora as unknown as string;
          this.socializacionForm.patchValue({
            fecha: fechaParsed,
            lugar: data.lugar,
            hora: typeof hStr === 'string' ? hStr.substring(0, 5) : ''
          });

        } else {
          this.socializacionData.set(null);
          this.estaSocializado.set(false);
          this.socializacionForm.reset();
          this.fechaSignal.set(new Date());
          this.lugarSignal.set('');
          this.horaSignal.set(new Date());
        }
      },
      error: (err) => console.error('Error al cargar socialización:', err)
    });
  }

  public cargarDatosAdicionalesProcedimiento(idProcedimiento: number): void {
    this.documentoSoporteService.getPorProcedimiento(idProcedimiento).subscribe({
      next: (documentoSoporte: any) => {
        console.log('Datos cargados - Documento Soporte:', documentoSoporte);
        if (documentoSoporte?.id) {
          this.cargarFormularioDAAC(documentoSoporte.id);
          this.cargarDocumentosBase(documentoSoporte.id);
          this.cargarDiagramaFlujo(documentoSoporte.id);
        } else {
          this.formularioDAAC = [];
          this.documentosBase = [];
          this.imagenDiagrama = null;
        }
      },
      error: (err) => {
        console.error('Error al obtener documento soporte:', err);
        this.formularioDAAC = [];
        this.documentosBase = [];
        this.imagenDiagrama = null;
      }
    });
    this.cargarSoporteComputacional(idProcedimiento);
  }

  public cargarFormularioDAAC(idDocumentoSoporte: number): void {
    this.formularioDAACService.obtenerPorDocumento(idDocumentoSoporte).subscribe({
      next: (data: any) => {
        console.log('Datos cargados - Formulario DAAC:', data);
        if (data) {
          this.mapearDatosDAAC(data);
        } else {
          this.formularioDAAC = [];
        }
      },
      error: (err) => {
        console.error('Error al obtener formulario DAAC:', err);
        this.formularioDAAC = [];
      }
    });
  }

  public cargarDocumentosBase(idDocumentoSoporte: number): void {
    this.reglamentoBaseService.obtenerReglamentoBasePorDocumento(idDocumentoSoporte).subscribe({
      next: (reglamentoBase: ReglamentoBase | ReglamentoBase[]) => {
        console.log('Datos cargados - Documentos Base:', reglamentoBase);
        this.documentosBase = Array.isArray(reglamentoBase) ? reglamentoBase : (reglamentoBase ? [reglamentoBase] : []);
      },
      error: (err) => {
        console.error('Error al obtener documentos base:', err);
        this.documentosBase = [];
      }
    });
  }

  public cargarDiagramaFlujo(idDocumentoSoporte: number): void {
    this.diagramaFlujoService.getDiagramaPdf(idDocumentoSoporte).subscribe({
      next: (diagramaFlujo: any) => {
        console.log('Datos cargados - Diagrama de Flujo (PDF):', diagramaFlujo ? 'Contiene base64' : null);
        this.imagenDiagrama = diagramaFlujo?.pdfBase64 || null;
      },
      error: (err) => {
        console.error('Error al cargar diagrama de flujo:', err);
        this.imagenDiagrama = null;
      }
    });
  }

  public cargarSoporteComputacional(idProcedimiento: number): void {
    this.soporteComputacionalService.getSoporteComputacional(idProcedimiento).subscribe({
      next: (soporte: SoporteComputacional) => {
        console.log('Datos cargados - Soporte Computacional:', soporte);
        this.soporteComputacional = soporte;
      },
      error: (err) => {
        console.error('Error al obtener soporte computacional:', err);
        this.soporteComputacional = null;
      }
    });
  }

  public descargarPDFDiagrama(): void {
    if (!this.imagenDiagrama) {
      this.alertService.error('No hay diagrama disponible para descargar.');
      return;
    }
    const linkfuente = `data:application/pdf;base64,${this.imagenDiagrama}`;
    const linkDescarga = document.createElement("a");
    const nombreArchivo = `diagrama_${this.procedimientoSeleccionado?.procedimiento}.pdf`;
    linkDescarga.href = linkfuente;
    linkDescarga.download = nombreArchivo;
    linkDescarga.click();
    this.alertService.infoExito('Descargando Diagrama de Flujo');
  }

  private mapearDatosDAAC(formulario: any): void {
    this.formularioDAAC = this.datosTablaService.columnasDAAC.map(columna => ({
      Criterio: columna.key,
      Descripcion: formulario[columna.key] || formulario[columna.label] || ''
    }));
  }

  public descargarProcedimientoCompletado(): void {
    if (!this.procedimientoSeleccionado?.id) {
      this.alertService.error('Debe seleccionar un procedimiento primero');
      return;
    }
    const id = this.procedimientoSeleccionado.id;
    this.alertService.infoExito('Preparando descarga del procedimiento completado...');
    this.socializacionService.descargarPdfSocializacion(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `procedimiento_${this.procedimientoSeleccionado?.procedimiento}_completado.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.alertService.infoExito('Descarga iniciada');
      },
      error: (err) => {
        console.error('Error al descargar el PDF:', err);
        this.alertService.error('Error al generar o descargar el PDF. Asegúrese de que ambos formatos (DAAC y Estandarización) estén subidos en el reglamento.');
      }
    });
  }

}

