import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, Inject, PLATFORM_ID, input, model, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser, TitleCasePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { DocumentoSoporteService } from '../../services/documento-soporte.service';
import { FormularioDAACService } from '../../services/formulario-daac.service';
import { SoporteComputacionalService } from '../../services/soporte-computacional.service';
import { ReglamentoBaseService } from '../../services/reglamento-base.service';
import { DatosService } from '../../../../shared/services/datos.service';
import { TocEntry } from '../../../../shared/interfaces/entry.interface';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ProcedimientoService } from '../../../identificacion-requerimientos/services/procedimiento.service';
import { DiagramaFlujoService } from '../../services/diagrama-flujo.service';

@Component({
  selector: 'app-formato-estandarizacion',
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './formato-estandarizacion.component.html',
  styleUrl: './formato-estandarizacion.component.css'
})
export class FormatoEstandarizacionComponent implements AfterViewInit {
  @ViewChild('contentSource') contentSource!: ElementRef;

  datosFormulario = model<any>({});
  procedimientoId = input<number | null>(null);

  // Valores de asignacion
  documentosBase: any[] = [];
  formularioDAAC: any = {};
  soporteComputacional: any = null;
  procedimientosSeleccionado: any = null;
  idProcedimiento: string | null = null;

  // Pages array to hold the distributed content
  pages: any[][] = [];
  tocEntries: TocEntry[] = [];

  //Servicios e inyecciones de dependencias
  private cdr = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);
  private route = inject(ActivatedRoute);
  private procedimientoService = inject(ProcedimientoService);
  private documentoSoporteService = inject(DocumentoSoporteService);
  private formularioDAACService = inject(FormularioDAACService);
  private reglamentoBaseService = inject(ReglamentoBaseService);
  private soporteComputacionalService = inject(SoporteComputacionalService);
  private diagramaFlujoService = inject(DiagramaFlujoService);
  private datosService = inject(DatosService);
  @Inject(PLATFORM_ID) private platformId = inject(PLATFORM_ID);


  ngOnInit() {
    const procedimiento = Number(this.route.snapshot.paramMap.get('id'));
    this.datosProcedimiento(procedimiento);
  }

  async generarPDF() {
    try {
      // Usar querySelectorAll restringido al elemento raíz si es posible, 
      // o asegurar que solo capturamos las páginas visibles de este componente
      const pages = document.querySelectorAll('.a4-page:not([style*="display: none"])');

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

        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => {
            // Fix for html2canvas oklch error and other layout issues
            const elements = clonedDoc.getElementsByTagName('*');
            for (let i = 0; i < elements.length; i++) {
              const el = elements[i] as HTMLElement;
              const style = window.getComputedStyle(el);

              // 1. Fix colors (oklch)
              const fixColor = (color: string) => {
                if (color && color.includes('oklch')) {
                  const temp = document.createElement('div');
                  temp.style.color = color;
                  clonedDoc.body.appendChild(temp);
                  const resolvedColor = window.getComputedStyle(temp).color;
                  clonedDoc.body.removeChild(temp);
                  return resolvedColor;
                }
                return color;
              };

              if (el.style) {
                if (style.color.includes('oklch')) el.style.color = fixColor(style.color);
                if (style.backgroundColor.includes('oklch')) el.style.backgroundColor = fixColor(style.backgroundColor);
                if (style.borderColor.includes('oklch')) el.style.borderColor = fixColor(style.borderColor);
              }

              // 2. Stabilize tables and flex items for html2canvas
              if (el.tagName === 'TABLE') {
                el.style.borderCollapse = 'collapse';
                el.style.width = '100%';
              }
            }
          }
        });

        const imgData = canvas.toDataURL('image/png');

        if (i > 0) {
          pdf.addPage();
        }

        // Ajustar imagen al tamaño A4 (210x297mm)
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      }

      pdf.save(filename);
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
          this.datosFormulario.set(formularioDAAC); // Keep for backward compatibility if used elsewhere
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
  imagenesDiagrama: string[] = [];

  // 

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

  // Constants for A4 page layout (in pixels approx, assuming 96 DPI or similar scaling)
  readonly PAGE_CONTENT_HEIGHT_PX = 870; // Increased to use more A4 space

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
      // Get height including margins
      const rect = child.getBoundingClientRect();
      const style = window.getComputedStyle(child);
      const marginTop = parseFloat(style.marginTop || '0');
      const marginBottom = parseFloat(style.marginBottom || '0');

      const totalItemHeight = rect.height + marginTop + marginBottom;
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

