import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-socializacionprocedimientos',
  imports: [ReactiveFormsModule, CommonModule, FormsModule,
    NavegacionComponent, ListaDesplegableComponent, TablaCriteriosComponent, TablasFormularioComponent],
  templateUrl: './socializacion-procedimientos.component.html',
  styleUrl: './socializacion-procedimientos.component.css'
})

export class SocializacionprocedimientosComponent implements OnInit {
  procedimientos: any[] = [];
  abrir = false;
  procedimientoSeleccionado: any = null;
  datosProcedimiento: { Criterio: string; Descripcion: string }[] = [];
  objectKeys = Object.keys;
  imagenDiagrama: string | null = null;
  documentosBase: any[] = [];
  soporteComputacional: any = null;
  FormularioDAAC: { Criterio: string; Descripcion: string }[] = [];

  //servicios e inyecciones de dependencias 
  public datosTablaService = inject(DatosService);
  public tablaService = inject(TablaProcedimientoService);
  public listaService = inject(EstadolistaService);
  public procedimientoService = inject(ProcedimientoService);
  public reglamentoBaseService = inject(ReglamentoBaseService);
  public formularioDAACService = inject(FormularioDAACService);
  public soporteComputacionalService = inject(SoporteComputacionalService);
  public documentoSoporteService = inject(DocumentoSoporteService);
  public diagramaFlujoService = inject(DiagramaFlujoService);
  public alertService = inject(AlertService);
  public estadoAsignacionService = inject(EstadoAsignacionService);
  public router = inject(Router);

  ngOnInit() {
    this.ObtenerProcedimientos();
    this.listaService.visible$.subscribe(valor => {
      this.abrir = valor;
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

  abrirListaSocializacion() {
    this.listaService.abrir(); // Se abre la lista al llegar a Socialización
  }

  cerrarModal() {
    this.abrir = false;
    this.listaService.cerrar();
  }

  fecha = '';
  lugar = '';
  socializado = false;

  registrarSocializacion() {
    if (this.fecha && this.lugar) {
      this.socializado = true;
    }
  }

  onSocializar(procedimiento: any) {
    const id = procedimiento.id || procedimiento.Id || procedimiento.ID || procedimiento.procedimientoId;

    if (!id) {
      this.alertService.error('No se pudo identificar el procedimiento');
      return;
    }

    this.estadoAsignacionService.obtenerCompletitud(id).subscribe({
      next: (estadoAsignacion) => {
        if (estadoAsignacion.estado === 'completo') {
          this.procedimientoSeleccionado = procedimiento;
          // Transformar el objeto seleccionado en filas para la tabla
          this.datosProcedimiento = Object.keys(procedimiento)
            .filter(key => key.toLowerCase() !== 'id') // Filtramos 'id'
            .map(key => ({
              Criterio: key.toUpperCase(),
              Descripcion: procedimiento[key]
            }));

          this.cargarDatosProcedimiento(id);
          this.cerrarModal();
          this.alertService.infoExito('Procedimiento Seleccionado');
        } else {
          this.alertService.error(`El procedimiento seleccionado está en estado "${estadoAsignacion.estado}", para verlo debe pasar a completo`).then(() => {
            this.router.navigate(['/identificacionrequerimientos']);
          });
        }
      },
      error: (err) => {
        console.error('Error al validar el estado del procedimiento:', err);
        this.alertService.error('Error al validar el estado del procedimiento');
      }
    });
  }

  cargarDatosProcedimiento(procedimientoId: number) {
    // 1. Obtener el documento soporte asociado al procedimiento
    this.documentoSoporteService.getPorProcedimiento(procedimientoId).subscribe({
      next: (documentoSoporte) => {
        if (documentoSoporte && documentoSoporte.id) {
          // 2. Con el documento soporte, cargar DAAC
          this.cargarFormularioDAAC(documentoSoporte.id);
          // 3. Cargar documentos base (reglamentos)
          this.cargarDocumentosBase(documentoSoporte.id);
          // 4. Cargar diagrama de flujo
          this.CargarDiagramaFlujo(documentoSoporte.id);
        } else {
          this.FormularioDAAC = [];
          this.documentosBase = [];
          this.imagenDiagrama = null;
        }
      },
      error: (err) => {
        console.error('Error al obtener documento soporte:', err);
        this.FormularioDAAC = [];
        this.documentosBase = [];
        this.imagenDiagrama = null;
      }
    });
    // 5. Cargar soporte computacional (usa procedimientoId directamente)
    this.cargarSoporteComputacional(procedimientoId);
  }

  cargarFormularioDAAC(documentoSoporteId: number) {
    this.formularioDAACService.obtenerPorDocumento(documentoSoporteId).subscribe({
      next: (formulario) => {
        if (formulario) {
          this.mapearDatosDAAC(formulario);
        } else {
          this.FormularioDAAC = [];
        }
      },
      error: (err) => {
        console.error('Error al obtener formulario DAAC:', err);
        this.FormularioDAAC = [];
      }
    });
  }

  cargarDocumentosBase(documentoSoporteId: number) {
    this.reglamentoBaseService.obtenerReglamentoBasePorDocumento(documentoSoporteId).subscribe({
      next: (documentos) => {
        this.documentosBase = Array.isArray(documentos) ? documentos : (documentos ? [documentos] : []);
      },
      error: (err) => {
        console.error('Error al obtener documentos base:', err);
        this.documentosBase = [];
      }
    });
  }

  CargarDiagramaFlujo(documentoSoporteId: number) {
    this.diagramaFlujoService.getDiagramaPdf(documentoSoporteId).subscribe({
      next: (data) => {
        if (data && data.pdfBase64) {
          this.imagenDiagrama = data.pdfBase64;
        } else {
          this.imagenDiagrama = null;
        }
      },
      error: (err) => {
        console.error('Error al cargar diagrama de flujo:', err);
        this.imagenDiagrama = null;
      }
    });
  }

  cargarSoporteComputacional(procedimientoId: number) {
    this.soporteComputacionalService.getSoporteComputacional(procedimientoId).subscribe({
      next: (soporte) => {
        this.soporteComputacional = soporte;
      },
      error: (err) => {
        console.error('Error al obtener soporte computacional:', err);
        this.soporteComputacional = null;
      }
    });
  }


  descargarPDFDiagrama() {
    if (!this.imagenDiagrama) {
      this.alertService.error('No hay diagrama disponible para descargar.');
      return;
    }

    const linkSource = `data:application/pdf;base64,${this.imagenDiagrama}`;
    const downloadLink = document.createElement("a");
    const fileName = `diagrama_${this.procedimientoSeleccionado?.procedimiento || 'export'}.pdf`;

    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
    this.alertService.infoExito('Descargando Diagrama de Flujo');
  }

  mapearDatosDAAC(formulario: any) {
    this.FormularioDAAC = this.datosTablaService.columnasDAAC.map(columna => {
      const valor = formulario[columna.key] || formulario[columna.label] || '';
      return {
        Criterio: columna.key,
        Descripcion: valor
      };
    });
  }


}


