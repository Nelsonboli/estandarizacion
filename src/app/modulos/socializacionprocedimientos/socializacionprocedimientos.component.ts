import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatosService } from '../../shared/servicios/datos.service';
import { NavegacionComponent } from '../../shared/component/navegacion/navegacion';
import { TablaService } from '../../shared/servicios/tabla.service';
import { EstadolistaService } from '../../shared/servicios/estadolista.service';
import { ListaDesplegableComponent } from '../../shared/component/lista-desplegable/lista-desplegable.component';
import { TablaCriteriosComponent } from '../../shared/component/tablaCriterios/tablaCriterios.component';
import { ProcedimientoService } from '../../shared/servicios/modulos/procedimiento.service';
import { FormularioDAACService } from '../../shared/servicios/modulos/formulario-daac.service';
import { SoporteComputacionalService } from '../../shared/servicios/modulos/soporte-computacional.service';
import { ReglamentoBaseService } from '../../shared/servicios/modulos/reglamento-base.service';
import { DocumentoSoporteService } from '../../shared/servicios/modulos/documento-soporte.service';
import { DiagramaFlujoService } from '../../shared/servicios/modulos/diagrama-flujo.service';
import { TablasFormularioComponent } from "../../shared/component/tablas-formulario/tablas-formulario.component";
import { AlertService } from '../../shared/Utils/Alertas/alert.service';

@Component({
  selector: 'app-socializacionprocedimientos',
  imports: [ReactiveFormsModule, CommonModule, FormsModule,
    NavegacionComponent, ListaDesplegableComponent, TablaCriteriosComponent, TablasFormularioComponent],
  templateUrl: './socializacionprocedimientos.component.html',
  styleUrl: './socializacionprocedimientos.component.css'
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
  columnaDocumentoBase = [
    { key: 'documento', label: 'Documentos base' }
  ];

  constructor(
    public datosTablaService: DatosService,
    public tablaService: TablaService,
    private listaService: EstadolistaService,
    private procedimientoService: ProcedimientoService,
    private reglamentoBaseService: ReglamentoBaseService,
    private formularioDAACService: FormularioDAACService,
    private soporteComputacionalService: SoporteComputacionalService,
    private documentoSoporteService: DocumentoSoporteService,
    private diagramaFlujoService: DiagramaFlujoService,
    private alertService: AlertService,
  ) { }

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
    this.procedimientoSeleccionado = procedimiento;
    // Transformar el objeto seleccionado en filas para la tabla
    this.datosProcedimiento = Object.keys(procedimiento)
      .filter(key => key.toLowerCase() !== 'id') // Filtramos 'id'
      .map(key => ({
        Criterio: key.toUpperCase(),
        Descripcion: procedimiento[key] // Pasamos el valor tal cual (array o string)
      }));
    // Cargar todos los datos relacionados con el procedimiento
    if (procedimiento.id) {
      this.cargarDatosProcedimiento(procedimiento.id);
    } else {
      // Intentar con otras posibles propiedades de ID
      const posibleId = procedimiento.Id || procedimiento.ID || procedimiento.procedimientoId;
      if (posibleId) {
        this.cargarDatosProcedimiento(posibleId);
      }
    }
    this.cerrarModal();
    this.alertService.infoExito('Procedimiento Seleccionado');
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

