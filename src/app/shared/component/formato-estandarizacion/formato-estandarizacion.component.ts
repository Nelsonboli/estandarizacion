import { Component, Input, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, TitleCasePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ProcedimientoService } from '../../servicios/modulos/procedimiento.service';
import { DocumentoSoporteService } from '../../servicios/modulos/documento-soporte.service';
import { FormularioDAACService } from '../../servicios/modulos/formulario-daac.service';
import { SoporteComputacionalService } from '../../servicios/modulos/soporte-computacional.service';
import { DiagramaFlujoService } from '../../servicios/modulos/diagrama-flujo.service';
import { ReglamentoBaseService } from '../../servicios/modulos/reglamento-base.service';
import { DatosService } from '../../servicios/datos.service';
import { TocEntry } from '../../../interfaces/Entry.interface';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-formato-estandarizacion',
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './formato-estandarizacion.component.html',
  styleUrl: './formato-estandarizacion.component.css'
})
export class FormatoEstandarizacionComponent implements AfterViewInit {
  @ViewChild('contentSource') contentSource!: ElementRef;

  // Valores de asignacion
  documentosBase: any[] = [];
  formularioDAAC: any = {};
  soporteComputacional: any = null;
  procedimientosSeleccionado: any = null;
  idProcedimiento: string | null = null;

  // Pages array to hold the distributed content
  pages: any[][] = [];
  tocEntries: TocEntry[] = [];
  pageHasDAAC: boolean[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private procedimientoService: ProcedimientoService,
    private documentoSoporteService: DocumentoSoporteService,
    private formularioDAACService: FormularioDAACService,
    private reglamentoBaseService: ReglamentoBaseService,
    private soporteComputacionalService: SoporteComputacionalService,
    private diagramaFlujoService: DiagramaFlujoService,
    private datosService: DatosService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }


  ngOnInit() {
    const procedimiento = Number(this.route.snapshot.paramMap.get('id'));
    this.datosProcedimiento(procedimiento);
  }

  async generarPDF() {
    console.log('Iniciando generación de PDF...');

    try {
      // Usar querySelectorAll restringido al elemento raíz si es posible, 
      // o asegurar que solo capturamos las páginas visibles de este componente
      const pages = document.querySelectorAll('.a4-page:not([style*="display: none"])');
      console.log(`Buscando .a4-page... Encontradas: ${pages.length}`);

      if (pages.length === 0) {
        const errorMensaje = 'Error: No se encontraron elementos con la clase ".a4-page". Verifica el HTML.';
        console.error(errorMensaje);
        alert(errorMensaje);
        return;
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const filename = this.procedimientosSeleccionado?.procedimiento
        ? `${this.procedimientosSeleccionado.procedimiento}.pdf`
        : 'reporte.pdf';

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        console.log(`Preparando captura de página ${i + 1} de ${pages.length}`);

        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          // No forzar dimensiones fijas aquí para evitar distorsiones, 
          // dejar que tome las del elemento real
        });

        console.log(`Página ${i + 1}: Canvas capturado con éxito (${canvas.width}x${canvas.height})`);
        const imgData = canvas.toDataURL('image/png');

        if (i > 0) {
          pdf.addPage();
          console.log(`Página ${i + 1}: Nueva página añadida al PDF`);
        }

        // Ajustar imagen al tamaño A4 (210x297mm)
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      }

      pdf.save(filename);
      console.log('PDF generado con éxito');
      alert('PDF generado y descargado con éxito');

    } catch (globalError) {
      console.error('Error al generar PDF:', globalError);
      alert('Error al generar PDF. Revisa la consola para más detalles.');
    }
  }

  //datos de procedimiento 
  datosProcedimiento(procedimientoId: number) {
    // 1. Obtener datos del procedimiento 
    this.procedimientoService.getProcedimiento(procedimientoId).subscribe({
      next: (procedimiento) => {
        this.procedimientosSeleccionado = procedimiento;
      },
      error: (err) => {
        console.error('Error al obtener procedimiento:', err);
      }
    });

    // 2. Obtener documento soporte para obtener datos relacionados (DAAC, Documentos Base, Diagrama Flujo)
    this.documentoSoporteService.getPorProcedimiento(procedimientoId).subscribe({
      next: (documentoSoporte) => {
        if (documentoSoporte && documentoSoporte.id) {
          this.cargarFormularioDAAC(documentoSoporte.id);
          this.cargarDocumentosBase(documentoSoporte.id);
          this.cargarDiagramaFlujo(documentoSoporte.id);
        } else {
          this.formularioDAAC = {};
          this.documentosBase = [];
        }
      },
      error: (err) => {
        console.error('Error al obtener documento soporte:', err);
        this.formularioDAAC = {};
        this.documentosBase = [];
      }
    });

    // 3. Obtener soporte computacional
    this.cargarSoporteComputacional(procedimientoId);
  }

  // Cargar formulario DAAC
  cargarFormularioDAAC(documentoSoporteId: number) {
    this.formularioDAACService.obtenerPorDocumento(documentoSoporteId).subscribe({
      next: (formularioDAAC) => {
        if (formularioDAAC && formularioDAAC.id) {
          this.formularioDAAC = formularioDAAC;
          this.datosFormulario = formularioDAAC; // Keep for backward compatibility if used elsewhere
        }
      }
    })
  }

  // Cargar documentos base
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

  // Cargar diagrama flujo
  cargarDiagramaFlujo(documentoSoporteId: number) {

  }

  //Cargar Sopporte Computacional
  cargarSoporteComputacional(procedimientoId: number) {
    this.soporteComputacionalService.getSoporteComputacional(procedimientoId).subscribe({
      next: (computacional) => {
        this.soporteComputacional = computacional;
      },
      error: (err) => {
        console.error('Error al obtener soporte computacional:', err);
        this.soporteComputacional = null;
      }
    });
  }

  //Estado del procedimiento
  estadoProcedimiento(): string {
    if (!this.procedimientosSeleccionado || !this.procedimientosSeleccionado.estado) return '';
    const estadoBusqueda = this.procedimientosSeleccionado.estado.trim();
    const estado = this.datosService.Estado_actual_procedimiento.find(
      e => e.estado.trim() === estadoBusqueda
    );
    if (estado) {
      return (estado?.descripcion)
    }
    return '';
  }



  @Input() datosFormulario: any = {};
  @Input() procedimientoId: number | null = null;

  // Constants for A4 page layout (in pixels approx, assuming 96 DPI or similar scaling)
  readonly PAGE_CONTENT_HEIGHT_PX = 800; // Adjusted safe area for content


  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Wait for images to load if possible, or just delay slightly
      setTimeout(() => {
        this.distributeContent();
      }, 500);
    }
  }

  distributeContent() {
    if (!this.contentSource) return;

    const sourceChildren = Array.from(this.contentSource.nativeElement.children) as HTMLElement[];
    let currentPage: HTMLElement[] = [];
    let currentHeight = 0;

    this.pages = [];
    this.tocEntries = [];

    sourceChildren.forEach((child) => {
      const height = child.offsetHeight;
      const style = window.getComputedStyle(child);
      const margin = parseInt(style.marginBottom || '0', 10) + parseInt(style.marginTop || '0', 10);

      const totalItemHeight = height + margin;
      const forceBreak = child.hasAttribute('data-force-break');

      if (currentHeight + totalItemHeight > this.PAGE_CONTENT_HEIGHT_PX || (forceBreak && currentPage.length > 0)) {
        // Push current page
        this.pages.push(currentPage);
        // Start new page
        currentPage = [];
        currentHeight = 0;
      }

      // Add to current page
      currentPage.push(child);
      currentHeight += totalItemHeight;
    });

    // Push last page
    if (currentPage.length > 0) {
      this.pages.push(currentPage);
    }

    // Scan pages to build TOC
    this.pages.forEach((page, pageIndex) => {
      page.forEach((element: HTMLElement) => {
        // Check if the element itself is a header or contains one
        let header = element.hasAttribute('data-section-id') ? element : element.querySelector('[data-section-id]');

        if (header) {
          const id = header.getAttribute('data-section-id');
          const title = header.getAttribute('data-section-title');

          if (id && title) {
            this.tocEntries.push({
              id: id,
              title: title,
              page: pageIndex + 1 // +1 because logic pages are 0-indexed, display is 1-indexed
            });

            // Set the actual ID on the element so anchor navigation works
            header.setAttribute('id', 'section-' + id);
          }
        }
      });
    });
    this.pageHasDAAC = [];

    this.pages.forEach((page) => {
      this.pageHasDAAC = this.pages.map((page) =>
        page.some((element: HTMLElement) => {
          return (
            element.closest('[data-is-daac]') !== null ||
            element.querySelector('[data-is-daac]') !== null ||
            element.hasAttribute('data-is-daac')
          );
        })
      );
    });

    this.cdr.detectChanges();
  }

  getTrustedHTML(item: HTMLElement): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(item.outerHTML);
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById('section-' + sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

}
