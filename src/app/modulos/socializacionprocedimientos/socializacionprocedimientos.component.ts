import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatosService } from '../../shared/servicios/datos.service';
import { NavegacionComponent } from '../../shared/component/navegacion/navegacion';
import { TablaService } from '../../shared/servicios/tabla.service';
import { EstadolistaService } from '../../shared/servicios/estadolista.service';
import { ListaDesplegableComponent } from '../../shared/component/lista-desplegable/lista-desplegable.component';
import { TablaCriteriosComponent } from '../../shared/component/tablaCriterios/tablaCriterios.component';
import { DiagramaService } from '../../shared/servicios/diagrama.service';
import { ProcedimientoService } from '../../shared/servicios/modulos/procedimiento.service';
import { FormularioDAACService } from '../../shared/servicios/modulos/formulario-daac.service';
import { SoporteComputacionalService } from '../../shared/servicios/modulos/soporte-computacional.service';
import { ReglamentoBaseService } from '../../shared/servicios/modulos/reglamento-base.service';
import { DocumentoSoporteService } from '../../shared/servicios/modulos/documento-soporte.service';
import { TablasFormularioComponent } from "../../shared/component/tablas-formulario/tablas-formulario.component";
import { jsPDF } from 'jspdf';
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
    private diagramaService: DiagramaService,
    private procedimientoService: ProcedimientoService,
    private reglamentoBaseService: ReglamentoBaseService,
    private formularioDAACService: FormularioDAACService,
    private soporteComputacionalService: SoporteComputacionalService,
    private documentoSoporteService: DocumentoSoporteService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.imagenDiagrama = this.diagramaService.cargarImagen();
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
        } else {
          this.FormularioDAAC = [];
          this.documentosBase = [];
        }
      },
      error: (err) => {
        console.error('Error al obtener documento soporte:', err);
        this.FormularioDAAC = [];
        this.documentosBase = [];
      }
    });
    // 4. Cargar soporte computacional (usa procedimientoId directamente)
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
      alert('No hay imagen de diagrama disponible para exportar.');
      return;
    }

    const img = new Image();
    img.src = this.imagenDiagrama;
    img.onload = () => {
      const imgWidth = img.width;
      const totalHeight = img.height;
      const pageHeight = 1122; // Altura de corte similar al DiagramaComponent

      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfPageWidth = 595.28;
      const pdfPageHeight = 841.89;

      const scale = pdfPageWidth / imgWidth;
      let heightLeft = totalHeight;
      let currentPage = 0;

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = imgWidth;
      sliceCanvas.height = pageHeight;
      const ctx = sliceCanvas.getContext('2d');

      while (heightLeft > 0) {
        if (currentPage > 0) pdf.addPage();

        if (ctx) {
          ctx.clearRect(0, 0, imgWidth, pageHeight);
          const currentSliceHeight = Math.min(pageHeight, heightLeft);

          ctx.drawImage(
            img,
            0, currentPage * pageHeight,
            imgWidth, currentSliceHeight,
            0, 0,
            imgWidth, currentSliceHeight
          );

          const sliceData = sliceCanvas.toDataURL('image/png');
          const currentScaledHeight = currentSliceHeight * scale;

          pdf.addImage(sliceData, 'PNG', 0, 0, pdfPageWidth, currentScaledHeight);
        }

        heightLeft -= pageHeight;
        currentPage++;
      }

      pdf.save(`diagrama_${this.procedimientoSeleccionado?.procedimiento || 'export'}.pdf`);
    };
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

