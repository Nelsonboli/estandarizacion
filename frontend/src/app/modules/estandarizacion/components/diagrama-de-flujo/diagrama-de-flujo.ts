import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, signal, output, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as joint from 'jointjs';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../shared/services/alert.service';
import { DiagramaFlujoService } from '../../services/diagrama-flujo.service';
import { BotonSimbolos } from '../../interfaces/botones-simbolos.interface';
import { JsonDiagrama } from '../../interfaces/documento-soporte.interface';

interface ClipboardData {
  elements: {
    id: string | number;
    type: string;
    attrs: any;
    size: { width: number; height: number };
    tipoCustom: string;
  }[];
  links: {
    type: string;
    sourceId: string | number;
    targetId: string | number;
    attrs: any;
  }[];
}

@Component({
  standalone: true,
  selector: 'app-diagrama-de-flujo',
  imports: [CommonModule, FormsModule],
  templateUrl: './diagrama-de-flujo.html',
  styleUrl: './diagrama-de-flujo.css'
})
export class DiagramaDeFlujoComponent implements AfterViewInit, OnDestroy {
  diagramaEnviado = output<boolean>();
  cancelarDiagrama = output<boolean>();
  procedimiento = input<string>('');
  documentoId = input<number | null>(null);

  // Handlers para limpieza
  private scrollHandler: any;
  private keydownHandler: any;

  @ViewChild('canvas') canvasRef!: ElementRef;
  textoNodo: string = '';
  private graph = new joint.dia.Graph();
  private paper!: joint.dia.Paper;
  private nodoOrigen: joint.dia.Element | null = null;
  private modoConexion = false;
  private contador = 10;
  private selectedElement: joint.dia.Element | null = null;
  private currentPaperHeight = 1122;

  // 👇 Propiedades para nuevas funcionalidades
  private selectedLink: joint.dia.Link | null = null;
  private selectionBox: joint.shapes.standard.Rectangle | null = null;
  private isSelecting = false;
  private startSelectionPos = { x: 0, y: 0 };

  //Servicios y dependencias
  private alertService = inject(AlertService);
  private diagramaFlujoService = inject(DiagramaFlujoService)

  // Propiedades para nuevas funcionalidades
  private selectedElements: joint.dia.Element[] = [];

  //  Control del popover
  popoverVisible = signal(false);
  popoverPos = signal({ x: 0, y: 0 });
  popoverText = signal('');
  currentElement: joint.dia.Element | null = null;

  // Propiedades para Copiar/Pegar
  private clipboard: ClipboardData | null = null;
  contextMenuVisible = signal(false);
  contextMenuPos = signal({ x: 0, y: 0 });


  // signal para el botón activo
  botonActivo = signal<BotonSimbolos | null>(null);

  // Control de posicionamiento secuencial
  private sequentialAdditionCount = 0;
  private lastAdditionTime = 0;

  // Control del tooltip del sidebar
  sidebarPopoverPos = signal({ x: 0, y: 0 });

  mostrarTooltip(event: MouseEvent, boton: BotonSimbolos) {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const isTopMenu = window.innerWidth < 1280;

    if (isTopMenu) {
      // Si el menú está arriba, mostrar el tooltip debajo
      this.sidebarPopoverPos.set({
        x: rect.left - 20,
        y: rect.bottom + 10
      });
    } else {
      // Si el menú está al lado (sidebar), mostrar el tooltip a la derecha
      this.sidebarPopoverPos.set({
        x: rect.right + 30,
        y: rect.top
      });
    }
    this.botonActivo.set(boton);
  }

  ocultarTooltip() {
    this.botonActivo.set(null);
  }

  // lista de botones
  botones: BotonSimbolos[] = [
    {
      nombre: 'Actividad',
      titulo: 'Actividad',
      descripcion: 'Representa la actividad que se lleva a cabo para el desarrollo correcto del Procedimiento.',
      imagen: 'assets/simbolos/actividad.svg',
      accion: () => this.crearFigura('actividad')
    },
    {
      nombre: 'Responsable',
      titulo: 'Responsable',
      descripcion: 'Indica qué funcionario o qué dependencia es responsable de llevar a cabo la actividad mencionada.',
      imagen: 'assets/simbolos/responsable.svg',
      accion: () => this.crearFigura('responsable')
    },
    {
      nombre: 'Inicio - Fin',
      titulo: 'Inicio / Fin',
      descripcion: 'Se utiliza para marcar el inicio y fin de las actividades.',
      imagen: 'assets/simbolos/inicio_fin.svg',
      accion: () => this.crearFigura('inicio_fin')
    },
    {
      nombre: 'Decisión',
      titulo: 'Decisión',
      descripcion: 'Forma utilizada para determinar qué hacer cuando se presenta una toma de decisiones dentro de la actividad planteada. ',
      imagen: 'assets/simbolos/decision.svg',
      accion: () => this.crearFigura('decision')
    },
    {
      nombre: 'Observación',
      titulo: 'Observación',
      descripcion: 'Hace referencia a la descripción de actividades, observaciones o datos que se requieran para hacer más comprensible el procedimiento.',
      imagen: 'assets/simbolos/observacion.svg',
      accion: () => this.crearFigura('observacion')
    },
    {
      nombre: 'Conector de Página',
      titulo: 'Conector de Página',
      descripcion: 'Usado para enlazar el flujo entre diferentes páginas.',
      imagen: 'assets/simbolos/conector_pagina.svg',
      accion: () => this.crearFigura('conector_pagina')
    },
    {
      nombre: 'Conector de Página',
      titulo: 'Conector de Página',
      descripcion: 'Cuando el diagrama de flujo del procedimiento es más extenso que una página, se utiliza para indicar la conexión a la pagina siguiente.',
      imagen: 'assets/simbolos/conector_pentagono.svg',
      accion: () => this.crearFigura('conector_fuera_pagina')
    },

    {
      nombre: 'Documento',
      titulo: 'Documento',
      descripcion: 'Cuando la actividad realizada genera un documento se utiliza este símbolo.',
      imagen: 'assets/simbolos/documento.svg',
      accion: () => this.crearFigura('documento')
    },
    {
      nombre: 'Conector',
      titulo: 'Conector',
      descripcion: 'Representa la unión entre símbolos, y marca al mismo tiempo el orden en que se deben desarrollar las actividades',
      imagen: 'assets/simbolos/conector.svg',
      accion: () => this.activarConexion()
    },
  ];


  ngAfterViewInit(): void {
    const cellNamespace = this.crearNamespace();
    this.configurarPaper(cellNamespace);
    this.registrarEventosPaper();
    this.configurarListenersGlobales();

    if (this.documentoId()) {
      this.cargarDiagramaExistente(cellNamespace);
    }
  }

  private crearNamespace(): any {
    return {
      ...joint.shapes,
      'standard.Link': joint.shapes.standard.Link,
      'Link': joint.shapes.standard.Link,
      'standard.Path': joint.shapes.standard.Path,
      'standard.Polygon': joint.shapes.standard.Polygon,
      'standard.Rectangle': joint.shapes.standard.Path, // Normalización
      'standard.Circle': joint.shapes.standard.Path,
      'standard.Ellipse': joint.shapes.standard.Path
    };
  }

  private configurarPaper(cellNamespace: any) {
    this.currentPaperHeight = this.obtenerPageHeight();

    this.paper = new joint.dia.Paper({
      el: this.canvasRef.nativeElement,
      model: this.graph,
      width: 825,
      gridSize: 1,
      drawGrid: true,
      height: this.currentPaperHeight,
      background: { color: '#ffffff' },
      defaultRouter: { name: 'manhattan' },
      defaultConnector: { name: 'rounded' },
      cellViewNamespace: cellNamespace,
      interactive: true,
      frozen: false,
      async: false,
      highResolution: true
    });

    this.paper.unfreeze();
    this.paper.setInteractivity(true);

    // Refuerzo centralizado de atributos para nuevas celdas
    (this.graph as any).on('add', (cell: joint.dia.Cell) => {
      if (cell.isElement()) {
        cell.attr('root/pointerEvents', 'auto');
        cell.attr('root/cursor', 'move');
        cell.attr('body/shapeRendering', 'geometricPrecision');
        if (!cell.attr('body/stroke') || cell.attr('body/stroke') === 'none') cell.attr('body/stroke', '#000000');
        if (!cell.attr('body/fill') || cell.attr('body/fill') === 'none') cell.attr('body/fill', '#FFFFFF');
        if (!cell.attr('body/strokeWidth')) cell.attr('body/strokeWidth', 0.7);

        if (cell.prop('tipo') !== 'observacion' && cell.prop('tipo') !== 'separador') {
          cell.attr({
            label: {
              refX: '50%', refY: '50%',
              textAnchor: 'middle', textVerticalAnchor: 'middle'
            }
          });
        }
      } else if (cell.isLink()) {
        cell.attr({
          line: {
            stroke: cell.attr('line/stroke') || '#000000',
            strokeWidth: cell.attr('line/strokeWidth') || 0.7,
            targetMarker: cell.attr('line/targetMarker') || { 'type': 'path', 'd': 'M 10 -5 0 0 10 5 Z' },
            shapeRendering: 'geometricPrecision'
          }
        });
      }
    });

    // Evento para mover múltiples elementos
    (this.graph as any).on('change:position', (cell: joint.dia.Cell, newPos: any, options: any) => {
      if (options.multiMove || !cell.isElement()) return;
      const element = cell as joint.dia.Element;
      if (this.selectedElements.some(el => el.id === element.id)) {
        const previousPos = (element as any).previous('position');
        const dx = newPos.x - previousPos.x;
        const dy = newPos.y - previousPos.y;
        this.selectedElements.forEach(el => {
          if (el.id !== element.id) {
            const p = el.position();
            el.position(p.x + dx, p.y + dy, { multiMove: true });
          }
        });
      }
    });
  }

  private registrarEventosPaper() {
    this.paper.on('element:pointerclick', (elementView: any) => {
      this.contextMenuVisible.set(false);
      const element = elementView.model as joint.dia.Element;

      if (!this.modoConexion) {
        this.currentElement = element;
        this.popoverVisible.set(true);
        const text = element.attr('label/text');
        this.popoverText.set(typeof text === 'string' ? text : '');
        this.actualizarPosPopover(elementView);
      } else if (this.modoConexion && this.nodoOrigen && this.nodoOrigen.id === element.id) {
        this.modoConexion = false;
        this.nodoOrigen = null;
        this.popoverVisible.set(true);
        const text = element.attr('label/text');
        this.popoverText.set(typeof text === 'string' ? text : '');
        this.actualizarPosPopover(elementView);
        this.seleccionarElemento(element, 'click');
        return;
      }

      this.seleccionarElemento(element, 'click');

      if (this.modoConexion && this.nodoOrigen && this.nodoOrigen.id !== element.id) {
        this.conectarElementos(this.nodoOrigen, element);
      }
    });

    this.paper.on('element:pointerdblclick', (elementView: any) => {
      this.contextMenuVisible.set(false);
      this.modoConexion = true;
      this.nodoOrigen = elementView.model as joint.dia.Element;
      this.seleccionarElemento(this.nodoOrigen, 'dblclick');
      this.popoverVisible.set(false);
      this.alertService.infoInformacion('Seleccione el destino');
    });

    this.paper.on('link:pointerclick', (linkView: any) => this.seleccionarLink(linkView.model as joint.dia.Link));

    this.paper.on('blank:pointerdown', (evt: any, x: number, y: number) => {
      this.limpiarTodo();
      this.contextMenuVisible.set(false);
      this.popoverVisible.set(false); // Refuerzo para asegurar que se cierre
      this.iniciarSeleccionArea(x, y);
    });

    this.paper.on('blank:pointermove', (evt: any, x: number, y: number) => {
      if (this.isSelecting) this.actualizarSeleccionArea(x, y);
    });

    this.paper.on('blank:pointerup', () => {
      if (this.isSelecting) this.terminarSeleccionArea();
    });

    this.paper.on('element:contextmenu', (elementView: any, evt: any, x: number, y: number) => {
      evt.preventDefault();
      this.seleccionarElemento(elementView.model as joint.dia.Element, 'right-click');
      this.contextMenuPos.set({ x, y });
      this.contextMenuVisible.set(true);
      this.popoverVisible.set(false);
    });

    this.paper.on('blank:contextmenu', (evt: any, x: number, y: number) => {
      evt.preventDefault();
      this.contextMenuPos.set({ x, y });
      this.contextMenuVisible.set(true);
      this.popoverVisible.set(false);
    });

    this.paper.on('cell:pointerup', (cellView: any) => {
      const cell = cellView.model;
      if (cell.isElement() && this.currentElement?.id === cell.id) {
        this.actualizarPosPopover(cellView as joint.dia.ElementView);
      }
    });

    this.paper.on('blank:pointerclick', () => {
      this.popoverVisible.set(false);
      this.contextMenuVisible.set(false);
    });

    // Prevenir menú nativo
    this.canvasRef.nativeElement.addEventListener('contextmenu', (e: Event) => e.preventDefault());
  }

  private conectarElementos(origen: joint.dia.Element, destino: joint.dia.Element) {
    const link = new joint.shapes.standard.Link();
    link.source(origen, { anchor: { name: 'center' }, connectionPoint: { name: 'boundary' } });
    link.target(destino, { anchor: { name: 'center' }, connectionPoint: { name: 'boundary' } });

    link.attr({
      line: {
        stroke: '#000000', strokeWidth: 1,
        targetMarker: { 'type': 'path', 'd': 'M 10 -5 0 0 10 5 Z' }
      }
    });

    link.router('orthogonal', { step: 10, padding: 10 });
    link.connector('rounded');

    if (origen.prop('tipo') === 'decision') {
      link.appendLabel({
        attrs: {
          text: {
            text: 'texto',
            fill: '#000000',
            fontSize: 10,
            pointerEvents: 'none'
          },
          rect: {
            fill: '#ffffff',
            stroke: '#9ca3af',
            strokeWidth: 0.7,
            rx: 3, ry: 3,
            refWidth: '120%',
            refHeight: '120%',
            refX: '-10%',
            refY: '-10%'
          }
        }
      });
    }

    if (origen.prop('tipo') === 'observacion' || destino.prop('tipo') === 'observacion') {
      link.attr('line/strokeDasharray', '5,5');
      link.attr('line/targetMarker/type', 'none');
      if (destino.prop('tipo') === 'observacion') {
        link.target(destino, { anchor: { name: 'left', args: { dx: 0 } }, connectionPoint: { name: 'boundary' } });
      }
    }

    link.addTo(this.graph);
    this.modoConexion = false;
    this.nodoOrigen = null;
    this.aplicarEstiloSeleccion(origen, 'normal');
    this.seleccionarElemento(destino, 'target');
  }

  private cargarDiagramaExistente(cellNamespace: any) {
    this.diagramaFlujoService.obtenerPorDocumento(this.documentoId()!).subscribe({
      next: (diag) => {
        if (!diag || !diag.json_diagrama) return;
        let jsonData = diag.json_diagrama;
        if (typeof jsonData === 'string') jsonData = JSON.parse(jsonData);

        this.graph.clear();
        const cells = jsonData.cells || [];
        const elements = cells.filter((c: any) => !c.type || !c.type.includes('Link'));
        const links = cells.filter((c: any) => c.type && c.type.includes('Link'));

        console.log('📦 [LOAD] Iniciando carga:', { elementos: elements.length, links: links.length });

        // 1. Cargar solo elementos primero
        this.migrarCeldasLegacy(elements, cellNamespace);
        this.graph.fromJSON({ cells: elements }, { cellNamespace });

        // 👉 EXTRAER ALTURA GUARDADA (Si existe)
        const savedHeight = jsonData.paperHeight || diag.json_diagrama?.paperHeight;
        if (savedHeight) {
          console.log('📏 [LOAD] Restaurando altura guardada:', savedHeight);
          this.paper.setDimensions(825, savedHeight);
          this.currentPaperHeight = savedHeight;
        }

        // 2. Esperar estabilización y cargar links manualmente
        setTimeout(() => {
          this.reconectarLinks(links);
          this.postProcesarLarga(jsonData);
        }, 150);
      },
      error: (err) => {
        console.error('Error al obtener el diagrama:', err);
        this.paper.setInteractivity(true);
      }
    });
  }

  private migrarCeldasLegacy(cells: any[], cellNamespace: any) {
    if (!cells || !Array.isArray(cells)) return;
    cells.forEach(cell => {
      // Migración de tipos
      if (['standard.Rectangle', 'Rectangle', 'standard.Circle', 'Circle', 'standard.Ellipse', 'Ellipse'].includes(cell.type)) {
        const oldType = cell.type;
        cell.type = 'standard.Path';
        if (!cell.attrs) cell.attrs = {};
        if (!cell.attrs.body) cell.attrs.body = {};

        if (oldType.includes('Rectangle')) cell.attrs.body.refD = 'M 0 0 H 100 V 100 H 0 Z';
        else if (oldType.includes('Circle')) cell.attrs.body.refD = 'M 0 50 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0';
        else if (oldType.includes('Ellipse')) cell.attrs.body.refD = 'M 0 50 a 50 25 0 1 0 100 0 a 50 25 0 1 0 -100 0';
      } else if (cell.type === 'link') {
        cell.type = 'standard.Link';
      }

      // Recuperar markup y atributos visuales
      if (cell.type && !cell.type.includes('Link')) {
        let constructor = cellNamespace[cell.type] || (joint.shapes as any)[cell.type];
        if (!constructor && cell.type.startsWith('standard.')) {
          constructor = (joint.shapes.standard as any)[cell.type.split('.')[1]];
        }
        if (!cell.markup && constructor) {
          cell.markup = constructor.prototype?.markup || constructor.markup;
        }

        if (cell.type === 'standard.Path' || (cell.type.includes('Path'))) {
          if (!cell.attrs.body.refD) {
            if (cell.tipoCustom === 'responsable') cell.attrs.body.refD = 'M 0 50 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0';
            else if (cell.tipoCustom === 'inicio_fin') cell.attrs.body.refD = 'M 0 50 a 50 25 0 1 0 100 0 a 50 25 0 1 0 -100 0';
          }
        } else if (cell.type.includes('Polygon')) {
          cell.attrs.body.refPoints = cell.attrs.body.refPoints || null;
        }

        if (!cell.attrs) cell.attrs = {};
        if (!cell.attrs.body) cell.attrs.body = {};
        cell.attrs.body.stroke = cell.attrs.body.stroke || '#000000';
        cell.attrs.body.fill = cell.attrs.body.fill || '#FFFFFF';
        cell.attrs.body.strokeWidth = cell.attrs.body.strokeWidth || 0.7;

        if (!cell.attrs.root) cell.attrs.root = { pointerEvents: 'auto', cursor: 'move' };
        if (!cell.attrs.label) cell.attrs.label = { fill: '#000000' };

        if (cell.tipoCustom === 'observacion') {
          cell.attrs.label.textVerticalAnchor = 'top';
          cell.attrs.label.refY = 8; // Bajar un poco más el texto
          cell.attrs.label.refX = 4;
          cell.attrs.label.textAnchor = 'start';
        } else if (cell.tipoCustom !== 'separador') {
          cell.attrs.label.textVerticalAnchor = 'middle';
          cell.attrs.label.refY = '50%';
          cell.attrs.label.refX = '50%';
          cell.attrs.label.textAnchor = 'middle';
        }
      }

      if (cell.type && cell.type.includes('Link')) {
        cell.type = 'standard.Link'; // Normalizar siempre
        if (!cell.markup) {
          cell.markup = joint.shapes.standard.Link.prototype.markup;
        }
        if (!cell.attrs) cell.attrs = {};
        if (!cell.attrs.line) cell.attrs.line = {};
        cell.attrs.line.stroke = cell.attrs.line.stroke || '#333333';
        cell.attrs.line.strokeWidth = cell.attrs.line.strokeWidth || 0.7;
        cell.attrs.line.targetMarker = cell.attrs.line.targetMarker || { 'type': 'path', 'd': 'M 10 -5 0 0 10 5 Z' };

        // 👉 Forzar router y connector si faltan
        cell.router = cell.router || { name: 'orthogonal' };
        cell.connector = cell.connector || { name: 'rounded' };
      }
    });
  }

  private postProcesarLarga(jsonData: any) {
    let maxContentY = 0;
    this.graph.getCells().forEach(cell => {
      const bbox = cell.getBBox();
      const y = bbox.y + bbox.height;
      if (y > maxContentY) maxContentY = y;

      if (cell.isElement()) {
        cell.attr('root/pointerEvents', 'auto');
        cell.attr('root/cursor', 'move');
      }

      const view = this.paper.findViewByModel(cell);
      if (view) {
        (view as any).update();
        if (cell.isLink()) {
          const link = cell as joint.dia.Link;
          link.toFront();

          // Forzar que el router se recalcule
          if (link.router()) {
            const currentRouter = link.router();
            link.router('manhattan'); // Fallback seguro temporal
            setTimeout(() => link.router(currentRouter as any), 10);
          }

          if (typeof (view as any).requestConnectionUpdate === 'function') {
            (view as any).requestConnectionUpdate();
          }

          // 👉 REFUERZO: Forzar renderizado de la conexión
          const connection = (view as any).getConnection();
          if (!connection) {
            console.warn('❗ Link sin conexión detectado en postProceso:', link.id);
            (view as any).render();
          }

          // Refrescar labels
          const labels = link.labels();
          if (labels && labels.length > 0) link.labels(labels);
        }
      }
    });

    const pageHeight = this.obtenerPageHeight();
    const separadores = this.graph.getElements().filter(el => el.prop('tipo') === 'separador');

    // Si hay separadores, la altura debe ser exactamente la cantidad de páginas cubiertas
    let baseHeight = pageHeight;
    if (separadores.length > 0) {
      const maxY = Math.max(...separadores.map(s => s.position().y));
      baseHeight = Math.ceil((maxY + 10) / pageHeight) * pageHeight;
    }

    // 👉 PRIORIZAR ALTURA ACTUAL (Si el usuario ya la ajustó o se cargó del JSON)
    const currentH = this.paper.options.height as number;
    let finalHeight = Math.max(baseHeight, Math.ceil((maxContentY + 20) / pageHeight) * pageHeight);

    // Si el finalHeight calculado es mayor que el actual, expandimos.
    // Pero si es menor, y hay contenido que lo justifica, expandimos.
    // Si borramos página, baseHeight será menor y finalHeight bajará.

    this.paper.setDimensions(825, finalHeight);
    this.currentPaperHeight = finalHeight;

    this.paper.unfreeze();
    this.paper.updateViews();
    this.paper.setInteractivity(true);
  }

  configurarListenersGlobales() {
    this.keydownHandler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (this.selectedLink) {
          this.selectedLink.remove();
          this.selectedLink = null;
        } else if (this.selectedElements.length > 0) {
          this.selectedElements.forEach(el => el.remove());
          this.selectedElements = [];
          this.popoverVisible.set(false);
        } else if (this.selectedElement) {
          this.eliminarElemento();
        }
      }
      if (event.ctrlKey && event.key === 'c') this.copiarElementos();
      if (event.ctrlKey && event.key === 'v') this.pegarElementos();
    };

    this.scrollHandler = () => {
      if (this.currentElement && this.popoverVisible()) {
        const view = this.paper?.findViewByModel(this.currentElement);
        if (view && view instanceof joint.dia.ElementView) this.actualizarPosPopover(view);
      }
      if (this.contextMenuVisible()) this.contextMenuVisible.set(false);
    };

    window.addEventListener('keydown', this.keydownHandler);
    window.addEventListener('scroll', this.scrollHandler, true);
  }

  ngOnDestroy(): void {
    if (this.keydownHandler) window.removeEventListener('keydown', this.keydownHandler);
    if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler, true);

    if (this.paper) {
      (this.paper as any).remove();
    }
    if (this.graph) {
      (this.graph as any).off('add');
      this.graph.clear();
    }
  }

  async eliminarDiagramaCompleto() {
    const result = await this.alertService.confirmar(
      '¿Estás seguro de eliminar el diagrama?',
      'Se borrará todo el contenido del canvas y los archivos asociados en el servidor.',
      'warning',
      '#d33',
      '#3085d6',
      'Eliminar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      const currentDocId = this.documentoId();
      if (currentDocId) {
        this.diagramaFlujoService.eliminarDiagrama(currentDocId).subscribe({
          next: () => {
            this.graph.clear();
            const pageHeight = this.obtenerPageHeight();
            if (this.paper) {
              this.paper.setDimensions(825, pageHeight);
              this.paper.updateViews();
            }
            this.currentPaperHeight = pageHeight;
            this.alertService.infoEliminar('Diagrama de flujo eliminado correctamente');
            this.diagramaEnviado.emit(true); // Para recargar estado en el componente padre
          },
          error: (err) => {
            console.error('Error al eliminar diagrama:', err);
            this.alertService.error('Error al eliminar el diagrama del servidor');
          }
        });
      } else {
        // Si no hay documentoId, solo limpiamos localmente
        this.graph.clear();
        const pageHeight = this.obtenerPageHeight();
        if (this.paper) {
          this.paper.setDimensions(825, pageHeight);
          this.paper.unfreeze();
          this.paper.updateViews();
        }
        this.currentPaperHeight = pageHeight;
        this.alertService.infoExito('Lienzo limpiado correctamente');
      }
    }
  }

  private seleccionarElemento(element: joint.dia.Element, tipo: 'click' | 'dblclick' | 'target' | 'right-click') {
    // Si cambio de selección, limpio lo anterior
    if (this.selectedElement && this.selectedElement.id !== element.id) {
      this.aplicarEstiloSeleccion(this.selectedElement, 'limpiar');
    }

    // Limpio selección de link si había
    if (this.selectedLink) {
      this.limpiarSeleccionLink(this.selectedLink);
      this.selectedLink = null;
    }

    // Limpiar selección múltiple anterior (si existe)
    if (this.selectedElements.length > 0) {
      this.selectedElements.forEach(el => {
        if (el.id !== element.id) this.aplicarEstiloSeleccion(el, 'limpiar');
      });
      // Reiniciamos la lista, ya que ahora es selección única
      this.selectedElements = [];
    }


    // Aplicar estilo de selección centralizado
    this.aplicarEstiloSeleccion(element, tipo === 'dblclick' ? 'editando' : 'activo');
    //Actualizar referencia
    this.selectedElement = element;
  }

  private seleccionarLink(link: joint.dia.Link) {
    if (this.selectedLink && this.selectedLink.id !== link.id) {
      this.limpiarSeleccionLink(this.selectedLink);
    }
    if (this.selectedElement) {
      this.aplicarEstiloSeleccion(this.selectedElement, 'limpiar');
      this.selectedElement = null;
    }
    this.currentElement = null; // 👉 Limpiar para evitar conflicto de edición


    link.attr({
      line: {
        stroke: '#2563eb', // Azul para destacar selección de flecha
        strokeWidth: 2
      }
    });
    this.selectedLink = link;
    this.popoverVisible.set(false); // Reset por seguridad

    // 👉 RESTRICCIÓN: Solo permitir edición si el origen es una DECISIÓN
    const sourceNode = link.getSourceElement();
    if (sourceNode && sourceNode.prop('tipo') === 'decision') {
      // Abrir popover para el link para editar su label (Texto de conexión)
      const labels = link.labels();
      const label = labels[0];
      const existingText = (label && label.attrs && (label.attrs as any).text) ? (label.attrs as any).text.text || '' : '';
      this.popoverText.set(typeof existingText === 'string' ? existingText : '');
      this.popoverVisible.set(true);

      // Posicionar popover EXACTAMENTE arriba del texto o punto medio del link
      const linkView = link.findView(this.paper);
      if (linkView) {
        const connection = (linkView as any).getConnection();
        if (connection) {
          const midPoint = connection.getPointAtLength(connection.getTotalLength() / 2);

          this.popoverPos.set({
            x: midPoint.x - 100,
            y: midPoint.y - 135 // Ajuste fino para estar arriba sin alejarse demasiado
          });
        }
      }
    }
  }

  private limpiarTodo() {
    this.contextMenuVisible.set(false);
    this.popoverVisible.set(false);
    this.currentElement = null;
    if (this.selectedElement) {
      this.aplicarEstiloSeleccion(this.selectedElement, 'limpiar');
      this.selectedElement = null;
    }
    if (this.selectedLink) {
      this.limpiarSeleccionLink(this.selectedLink);
      this.selectedLink = null;
    }
    // Limpiar selección múltiple
    this.selectedElements.forEach(el => this.aplicarEstiloSeleccion(el, 'limpiar'));
    this.selectedElements = [];

    this.modoConexion = false;
    this.nodoOrigen = null;
  }

  private limpiarSeleccionLink(link: joint.dia.Link) {
    link.attr({
      line: {
        stroke: '#000000', // Color negro por defecto
        strokeWidth: 0.7   // Grosor ultra-fino
      }
    });
  }

  /**
   * 👉 MÉTODO CENTRALIZADO DE ESTILOS
   * Unifica todos los métodos de 'seleccion...' previos en uno solo
   */
  private aplicarEstiloSeleccion(element: joint.dia.Element, modo: 'normal' | 'activo' | 'editando' | 'exito' | 'error' | 'limpiar') {
    const isObservacion = element.prop('tipo') === 'observacion';
    let stroke = '#000000';
    let strokeWidth = isObservacion ? 1 : 0.7;

    switch (modo) {
      case 'activo':
        stroke = '#2563eb'; // Azul vibrante para selección
        strokeWidth = 1.0;   // Más grueso para destacar
        break;
      case 'editando':
        stroke = '#22c55e'; // Verde para doble clic (modo edición)
        strokeWidth = 1.0;
        break;
      case 'exito': stroke = '#22c55e'; break; // Verde
      case 'error': stroke = '#ff0000'; break; // Rojo
      case 'limpiar':
      case 'normal':
        stroke = '#000000'; // Negro absoluto al deseleccionar
        strokeWidth = isObservacion ? 1 : 0.7;
        break;
    }

    element.attr('body/stroke', stroke);
    element.attr('body/strokeWidth', strokeWidth);
  }

  // 👇 Lógica de Selección de Área
  private iniciarSeleccionArea(x: number, y: number) {
    this.isSelecting = true;
    this.startSelectionPos = { x, y };

    // Crear rectángulo visual
    this.selectionBox = new joint.shapes.standard.Rectangle();
    this.selectionBox.position(x, y);
    this.selectionBox.resize(1, 1);
    this.selectionBox.attr({
      body: {
        fill: 'rgba(17,134,255,0.1)',
        stroke: '#3e9af9',
      }
    });
    this.selectionBox.addTo(this.graph);
  }

  private actualizarSeleccionArea(x: number, y: number) {
    if (!this.selectionBox) return;

    const width = x - this.startSelectionPos.x;
    const height = y - this.startSelectionPos.y;

    // Permitir selección en cualquier dirección (negativa/positiva)
    this.selectionBox.position(
      width > 0 ? this.startSelectionPos.x : x,
      height > 0 ? this.startSelectionPos.y : y
    );
    this.selectionBox.resize(Math.abs(width), Math.abs(height));
  }

  private terminarSeleccionArea() {
    if (!this.selectionBox) return;

    const bbox = this.selectionBox.getBBox();
    this.selectionBox.remove();
    this.selectionBox = null;
    this.isSelecting = false;

    // Encontrar elementos dentro del área
    const elementsValidos = this.graph.getElements().filter(el => {
      // Excluir si es el propio box (ya removido pero por seguridad) o links
      if (el.isLink()) return false;
      // Verificar si el centro del elemento está dentro de la selección
      // o intersección completa. Usaremos centro por simplicidad de UX
      const center = el.getBBox().center();
      return bbox.containsPoint(center);
    });

    // Seleccionar los encontrados
    this.selectedElements = elementsValidos;

    this.selectedElements.forEach(el => {
      this.aplicarEstiloSeleccion(el, 'activo'); // Selección gruesa (gris)
    });

    if (this.selectedElements.length > 0) {
      this.alertService.infoInformacion(`${this.selectedElements.length} Elementos seleccionados`);
    }
  }


  private actualizarPosPopover(view: joint.dia.ElementView) {
    const bbox = view.getBBox();
    // BBox ya son coordenadas locales del paper. 
    // Como el contenedor es relativo, posicionamos absolutamente usando estas mismas coordenadas.
    this.popoverPos.set({
      x: bbox.x + (bbox.width / 2) - 100, // Centrado horizontal
      y: bbox.y - 135 // Posición optimizada para elementos
    });
  }
  private eliminarElemento() {
    if (this.selectedElement) {
      this.selectedElement.remove();

      if (this.currentElement === this.selectedElement) {
        this.currentElement = null;
        this.popoverVisible.set(false);
        this.popoverText.set('');
      }

      this.selectedElement = null;
      this.nodoOrigen = null;
    }
  }


  // 👉 Método que se llama desde el botón del popover o menú contextual
  eliminarConBoton() {
    let algoEliminado = false;

    // 1. Eliminar selección múltiple
    if (this.selectedElements.length > 0) {
      this.selectedElements.forEach(el => el.remove());
      this.selectedElements = [];
      algoEliminado = true;
    }
    // 2. Eliminar link seleccionado
    else if (this.selectedLink) {
      this.selectedLink.remove();
      this.selectedLink = null;
      algoEliminado = true;
    }
    // 3. Eliminar elemento único seleccionado
    else if (this.selectedElement) {
      this.eliminarElemento();
      algoEliminado = true;
    }

    if (algoEliminado) {
      this.popoverVisible.set(false); // Por si acaso
      this.alertService.infoEliminar('Elemento eliminado');
    } else {
      this.alertService.infoInformacion('No hay ningún elemento seleccionado para eliminar');
    }
  }

  // 📋 Lógica de Copiar / Pegar
  copiarElementos() {
    let itemsToCopy: joint.dia.Element[] = [];

    if (this.selectedElements.length > 0) {
      itemsToCopy = [...this.selectedElements];
    } else if (this.selectedElement) {
      itemsToCopy = [this.selectedElement];
    }

    if (itemsToCopy.length === 0) {
      this.alertService.infoInformacion('No hay elementos seleccionados para copiar');
      return;
    }

    const elementIds = new Set(itemsToCopy.map(el => el.id));

    // Buscar links que conecten solo elementos de la lista copiada
    const linksToCopy = this.graph.getLinks().filter(link => {
      const sourceId = link.source().id;
      const targetId = link.target().id;
      return elementIds.has(sourceId as string) && elementIds.has(targetId as string);
    });

    this.clipboard = {
      elements: itemsToCopy.map(el => ({
        id: el.id,
        type: (el.constructor as any).type || (el as any).get('type'),
        attrs: JSON.parse(JSON.stringify((el as any).attributes.attrs)),
        size: { ...el.size() },
        tipoCustom: el.prop('tipo')
      })),
      links: linksToCopy.map(link => ({
        type: (link.constructor as any).type || (link as any).get('type'),
        sourceId: link.source().id as string | number,
        targetId: link.target().id as string | number,
        attrs: JSON.parse(JSON.stringify((link as any).attributes.attrs))
      }))
    };

    this.alertService.infoInformacion(`${itemsToCopy.length} Símbolos y ${linksToCopy.length} Conexiones copiadas`);
  }

  pegarElementos() {
    if (!this.clipboard || (this.clipboard.elements.length === 0)) {
      this.alertService.infoInformacion('El portapapeles está vacío');
      return;
    }

    this.limpiarTodo();
    const centroVisible = this.obtenerCentroVisible();
    const nuevosElementos: joint.dia.Element[] = [];
    const idMap: { [key: string]: string } = {};

    // 1. Calcular el centro del grupo en el clipboard para reposicionarlo
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    this.clipboard.elements.forEach((data: any) => {
      const pos = data.attrs.position || { x: 0, y: 0 };
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + data.size.width);
      maxY = Math.max(maxY, pos.y + data.size.height);
    });

    const grupoCentroX = (minX + maxX) / 2;
    const grupoCentroY = (minY + maxY) / 2;

    const dx = centroVisible.x - grupoCentroX;
    const dy = centroVisible.y - grupoCentroY;

    // 2. Crear elementos
    this.clipboard.elements.forEach((data: any) => {
      let element: joint.dia.Element;

      if (data.type === 'standard.Circle') {
        element = new joint.shapes.standard.Path();
        element.attr('body/refD', 'M 0 50 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0');
      } else if (data.type === 'standard.Ellipse') {
        element = new joint.shapes.standard.Path();
        element.attr('body/refD', 'M 0 50 a 50 25 0 1 0 100 0 a 50 25 0 1 0 -100 0');
      } else if (data.type === 'standard.Rectangle') {
        element = new joint.shapes.standard.Path();
        element.attr('body/refD', 'M 0 0 H 100 V 100 H 0 Z');
      } else if (data.type === 'standard.Polygon') {
        element = new joint.shapes.standard.Polygon();
      } else if (data.type === 'standard.Path') {
        element = new joint.shapes.standard.Path();
      } else {
        element = new joint.shapes.standard.Path();
        element.attr('body/refD', 'M 0 0 H 100 V 100 H 0 Z');
      }

      element.attr(data.attrs);
      element.resize(data.size.width, data.size.height);
      if (data.tipoCustom) element.prop('tipo', data.tipoCustom);

      const oldPos = data.attrs.position || { x: 0, y: 0 };
      element.position(oldPos.x + dx, oldPos.y + dy);

      element.addTo(this.graph);
      idMap[data.id] = element.id as string;
      nuevosElementos.push(element);
    });

    // 3. Crear links
    this.clipboard.links.forEach((linkData: any) => {
      const link = new joint.shapes.standard.Link();
      link.source({ id: idMap[linkData.sourceId] });
      link.target({ id: idMap[linkData.targetId] });
      link.attr(linkData.attrs);

      // Aplicar configuraciones de router y connector para que se vea igual
      link.router('orthogonal', { step: 10, padding: 10 });
      link.connector('rounded');

      link.addTo(this.graph);
    });

    this.selectedElements = nuevosElementos;
    this.selectedElements.forEach(el => this.aplicarEstiloSeleccion(el, 'activo'));
    this.alertService.infoExito(`${nuevosElementos.length} Elementos pegados`);
  }
  guardarPopover() {
    const nuevoTexto = this.popoverText();
    if (this.currentElement) {
      this.currentElement.attr('label/text', nuevoTexto);
      this.ajustarTamanoElemento(this.currentElement, nuevoTexto);
    } else if (this.selectedLink) {
      // Si hay un link seleccionado, actualizamos su label
      const labels = JSON.parse(JSON.stringify(this.selectedLink.labels()));
      if (labels.length > 0) {
        labels[0].attrs.text.text = nuevoTexto;
        this.selectedLink.labels(labels); // Re-set completo para asegurar reactividad
      } else {
        this.selectedLink.appendLabel({
          attrs: {
            text: { text: nuevoTexto, fill: '#000000', fontSize: 10, pointerEvents: 'none' },
            rect: {
              fill: '#ffffff', stroke: '#000000', strokeWidth: 0.7, rx: 3, ry: 3,
              refWidth: '120%', refHeight: '120%', refX: '-10%', refY: '-10%'
            }
          }
        });
      }
    }
    this.popoverVisible.set(false);
  }

  // 📏 Ajuste dinámico de tamaño según texto
  private ajustarTamanoElemento(element: joint.dia.Element, texto: string) {
    const tipo = element.prop('tipo');
    if (tipo === 'conector_pagina' || tipo === 'conector_fuera_pagina') return;

    const isObservacion = tipo === 'observacion';
    const type = (element as any).get('type');
    const refD = element.attr('body/refD') || '';
    const isResponsable = tipo === 'responsable';

    // Configuración base más ajustada
    let minHeight = isObservacion ? 25 : 40; // Aún más pequeño
    if (isResponsable) minHeight = 35;

    const paddingVertical = 2; // Reducido
    const charWidth = 7.2; // Más ajustado
    const lineHeight = 12.5; // Más compacto

    const maxWidth = 350; // Más angosto para observaciones
    const maxInitialWidth = 40; // Crecimiento más rápido hacia abajo
    let minWidth = 120;
    if (isResponsable) minWidth = 35;

    // Calcular ancho objetivo inicial
    const estimatedTextWidth = texto.length * charWidth;
    let targetTextWidth = Math.max(minWidth, Math.min(maxInitialWidth, estimatedTextWidth));

    // Si el texto es muy largo, nos quedamos en maxInitialWidth inicialmente
    // Pero si es observación, usamos maxWidth
    if (isObservacion) targetTextWidth = maxWidth;

    const paragraphs = texto.split('\n');
    let totalLinesNeeded = 0;

    const calculateLines = (width: number) => {
      let lines = 0;
      paragraphs.forEach(p => {
        let shapeWidthEfficiency = 1.0;
        if (type === 'standard.Circle' || refD.includes('a 50 50')) shapeWidthEfficiency = 0.85;
        else if (type === 'standard.Ellipse' || refD.includes('a 50 25')) shapeWidthEfficiency = 0.8;
        else if (type === 'standard.Polygon' && !isObservacion) shapeWidthEfficiency = 0.7;

        const usableWidth = width * shapeWidthEfficiency;
        const pLines = Math.max(1, Math.ceil((p.length * charWidth) / usableWidth));
        lines += pLines;
      });
      return lines;
    };

    if (isObservacion) {
      targetTextWidth = maxWidth - 20;
      // 👉 REFUERZO: Rompemos el texto manualmente
      const brokenText = joint.util.breakText(texto, { width: targetTextWidth }, { 'font-size': 11 });
      element.attr('label/text', brokenText);
    }
    totalLinesNeeded = calculateLines(targetTextWidth);

    // Si con el ancho inicial necesitamos demasiadas líneas, podemos intentar expandir el ancho un poco más hasta maxWidth
    if (totalLinesNeeded > 3 && targetTextWidth < maxWidth && !isResponsable) {
      targetTextWidth = Math.min(maxWidth, targetTextWidth + 40);
      totalLinesNeeded = calculateLines(targetTextWidth);
    }

    const estimatedHeight = (totalLinesNeeded * lineHeight) + (paddingVertical * 2) + 2;
    const finalHeight = Math.max(minHeight, estimatedHeight);

    if (isObservacion) {
      element.resize(10, finalHeight);
      // Ya lo rompimos arriba con breakText, pero esto ayuda al alineamiento
      element.attr('label/textVerticalAnchor', 'top');
      element.attr('label/textAnchor', 'start');
      element.removeAttr('label/textWrap'); // Limpiar para evitar conflictos
    } else {
      let finalWidth = targetTextWidth + 20;
      let actualHeight = finalHeight;

      // 👉 REFUERZO DE FORMA: Si es un círculo, forzar relación 1:1
      if (type === 'standard.Circle' || refD.includes('a 50 50')) {
        const side = Math.max(finalWidth, actualHeight);
        finalWidth = side;
        actualHeight = side;
      }

      // 👉 CRECIMIENTO SIMÉTRICO: Ajustar posición para que crezca "hacia arriba" y laterales igual
      const currentSize = element.size();
      const diffX = (finalWidth - currentSize.width) / 2;
      const diffY = (actualHeight - currentSize.height) / 2;

      if (Math.abs(diffX) > 0.1 || Math.abs(diffY) > 0.1) {
        element.translate(-diffX, -diffY);
      }

      element.resize(finalWidth, actualHeight);

      let wrapWidthOffset = -10;
      // 👉 Reducir margen de envoltorio para círculos para aprovechar el centro
      if (type === 'standard.Circle' || refD.includes('a 50 50')) wrapWidthOffset = -12;
      else if (type === 'standard.Polygon' && !isObservacion) wrapWidthOffset = -35;
      else if (type === 'standard.Ellipse' || refD.includes('a 50 25')) wrapWidthOffset = -25;

      element.attr('label/textWrap', {
        width: wrapWidthOffset,
        height: null,
        ellipsis: true
      });
    }
  }

  private activarConexion() {
    this.modoConexion = true;
    this.nodoOrigen = null;
  }

  // Obtener el centro visible del viewport del paper
  private obtenerCentroVisible(): { x: number, y: number } {
    try {
      const container = this.canvasRef.nativeElement.closest('.overflow-x-auto') || this.canvasRef.nativeElement;
      const now = Date.now();

      if (now - this.lastAdditionTime > 4000) {
        this.sequentialAdditionCount = 0;
      }

      // Valores por defecto seguros si fallan los cálculos
      let localX = 400;
      let localY = 300;

      // Intentar calcular centro real del viewport
      const canvasRect = this.canvasRef.nativeElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Si el canvas es visible en pantalla, calcular centro relativo
      if (canvasRect.width > 0) {
        localX = (viewportWidth / 2) - canvasRect.left;
        localY = (viewportHeight / 2) - canvasRect.top;
      }

      // Aplicar cascada (30px cada vez)
      localX += (this.sequentialAdditionCount * 30);
      localY += (this.sequentialAdditionCount * 30);

      // Clamping Horizontal (DiagramaDeFlujo
      //  tiene 825px de ancho)
      localX = Math.max(100, Math.min(700, localX));

      // Clamping Vertical
      const paperH = (this.paper?.options.height as number) || this.obtenerPageHeight();
      localY = Math.max(100, Math.min(paperH - 100, localY));

      this.lastAdditionTime = now;
      this.sequentialAdditionCount++;

      return { x: localX, y: localY };
    } catch (e) {
      console.warn('Error calculando centro visible, usando valores por defecto', e);
      return { x: 400, y: 300 };
    }
  }

  /**
   * 👉 MÉTODO GENÉRICO DE CREACIÓN
   * Reemplaza todos los métodos agregarActividad, agregarResponsable, etc.
   */
  crearFigura(tipo: string) {
    const centro = this.obtenerCentroVisible();
    let element: joint.dia.Element;
    let textoDefault = '';
    let config: any = {};

    switch (tipo) {
      case 'responsable':
        element = new joint.shapes.standard.Path();
        textoDefault = 'Responsable';
        config = {
          size: { w: 40, h: 40 },
          attrs: { body: { refD: 'M 0 50 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0' }, label: { textWrap: { width: -10 } } }
        };
        break;
      case 'inicio_fin':
        element = new joint.shapes.standard.Path();
        textoDefault = 'Inicio/Fin';
        config = {
          size: { w: 100, h: 50 },
          attrs: { body: { refD: 'M 0 50 a 50 25 0 1 0 100 0 a 50 25 0 1 0 -100 0' }, label: { textWrap: { width: -25 } } }
        };
        break;
      case 'observacion':
        element = new joint.shapes.standard.Polygon();
        textoDefault = 'Descripción...';
        config = {
          size: { w: 10, h: 30 },
          attrs: {
            body: { refPoints: '0,0  10,0  10,0  0,0  0,10  10,10  10,10  0,10' },
            label: { textAnchor: 'start', textVerticalAnchor: 'top', refX: 5, refY: 8 }
          }
        };
        break;
      case 'conector_pagina':
        element = new joint.shapes.standard.Path();
        textoDefault = 'Pag';
        config = {
          size: { w: 45, h: 45 },
          attrs: { body: { refD: 'M 0 50 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0' } }
        };
        break;
      case 'conector_fuera_pagina':
        element = new joint.shapes.standard.Polygon();
        textoDefault = 'Pg';
        config = {
          size: { w: 45, h: 45 },
          attrs: { body: { refPoints: '0,0 60,0 60,40 30,60 0,40' } }
        };
        break;
      case 'documento':
        element = new joint.shapes.standard.Polygon();
        textoDefault = 'Documento';
        config = {
          size: { w: 120, h: 60 },
          attrs: { body: { refPoints: '0,0 140,0 140,55 100,70 0,70' }, label: { textWrap: { width: -20 } } }
        };
        break;
      case 'decision':
        element = new joint.shapes.standard.Polygon();
        textoDefault = 'Decisión';
        config = {
          size: { w: 90, h: 60 },
          attrs: { body: { refPoints: '50,0 100,50 50,100 0,50' }, label: { textWrap: { width: -30 } } }
        };
        break;
      default: // actividad
        element = new joint.shapes.standard.Path();
        textoDefault = 'Actividad';
        config = {
          size: { w: 100, h: 50 },
          attrs: { body: { refD: 'M 0 0 H 100 V 100 H 0 Z' }, label: { textWrap: { width: -15 } } }
        };
    }

    const texto = this.obtenerTexto(textoDefault);
    element.prop('tipo', tipo);
    element.position(centro.x - (config.size.w / 2), centro.y - (config.size.h / 2));
    element.resize(config.size.w, config.size.h);

    // Aplicar atributos base + específicos
    element.attr({
      body: { fill: '#fff', stroke: '#000', strokeWidth: 0.7, ...config.attrs?.body },
      label: {
        text: texto, fill: 'black', fontSize: 10,
        refX: '50%', refY: '50%', textAnchor: 'middle', textVerticalAnchor: 'middle',
        ...config.attrs?.label
      }
    });

    element.addTo(this.graph);
    if (tipo !== 'conector_pagina' && tipo !== 'conector_fuera_pagina') {
      this.ajustarTamanoElemento(element, texto);
    }
    this.contador++;
  }


  private obtenerPageHeight(): number {
    // Proporción A4: 297/210 = 1.4142857
    // Usamos ancho fijo de 825px para consistencia en todas las pantallas
    const currentWidth = 825;
    return Math.floor(currentWidth * 1.4142);
  }

  // 👇 Nueva funcionalidad: Paginación
  agregarPagina() {
    const currentHeight = this.paper.options.height as number || this.obtenerPageHeight();
    const pageHeight = this.obtenerPageHeight();
    const newHeight = typeof currentHeight === 'number' ? currentHeight + pageHeight : pageHeight * 2;

    this.paper.setDimensions(825, newHeight);

    // Dibujar línea de separación visual
    const separator = new joint.shapes.standard.Path();
    separator.resize(2000, 2);
    separator.position(0, currentHeight);

    // 👇 Etiquetamos como separador para ocultarlo al exportar
    separator.prop('tipo', 'separador');

    separator.attr({
      body: {
        d: `M 0 0 H 825`,
        stroke: '#000000',
        strokeWidth: 1,
        strokeDasharray: '5,5',
        fill: 'none'
      },
      label: {
        text: ' --- Fin de Página --- ',
        fill: '#6b7280',
        fontSize: 12,
        fontWeight: 'bold',
        textVerticalAnchor: 'bottom',
        refY: -5
      }
    });
    separator.attr('body/pointer-events', 'none');
    separator.addTo(this.graph);
    this.alertService.infoExito('Nueva página agregada');
  }

  private toggleSeparadores(mostrar: boolean) {
    const separadores = this.graph.getElements().filter(el => el.prop('tipo') === 'separador');
    separadores.forEach(sep => {
      sep.attr('root/display', mostrar ? 'block' : 'none');
    });
  }

  exportar() {
    this.toggleSeparadores(false);
    htmlToImage.toPng(this.canvasRef.nativeElement, { fontEmbedCSS: '' }).then(dataUrl => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'diagrama de flujo ' + this.procedimiento + '.png';
      a.click();
      this.toggleSeparadores(true);
    }).catch(err => {
      console.error(err);
      this.toggleSeparadores(true);
    });
  }

  eliminarUltimaPagina() {
    const separadores = this.graph.getElements().filter(el => el.prop('tipo') === 'separador');
    if (separadores.length > 0) {
      // Obtener el último separador basado en su posición Y
      const ultimoSeparador = separadores.reduce((prev, current) => (prev.position().y > current.position().y) ? prev : current);
      ultimoSeparador.remove();

      // Recalcular la altura basada en los separadores restantes
      const pageHeight = this.obtenerPageHeight();
      const separadoresRestantes = this.graph.getElements().filter(el => el.prop('tipo') === 'separador');

      let newHeight = pageHeight;
      if (separadoresRestantes.length > 0) {
        const maxY = Math.max(...separadoresRestantes.map(s => s.position().y));
        newHeight = Math.ceil((maxY + 10) / pageHeight) * pageHeight;
      }

      this.paper.setDimensions(825, newHeight);
      this.currentPaperHeight = newHeight;

      this.alertService.infoExito('Última página eliminada');
    } else {
      this.alertService.infoInformacion('No hay páginas adicionales para eliminar');
    }
  }

  async exportarPDF(guardarSolo = false): Promise<string | null> {
    try {
      this.toggleSeparadores(false);
      const canvas = await htmlToImage.toCanvas(this.canvasRef.nativeElement, { fontEmbedCSS: '' });
      const imgWidth = canvas.width;
      const totalHeight = canvas.height;

      const pageHeight = Math.floor(imgWidth * 1.4142);
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfPageWidth = 595.28;
      const scale = pdfPageWidth / imgWidth;

      let heightLeft = totalHeight;
      let currentPage = 0;

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = imgWidth;
      sliceCanvas.height = pageHeight;
      const ctx = sliceCanvas.getContext('2d');

      while (heightLeft > 0) {
        if (currentPage > 0) pdf.addPage();
        if (ctx) ctx.clearRect(0, 0, imgWidth, pageHeight);
        const currentSliceHeight = Math.min(pageHeight, heightLeft);
        if (ctx) {
          ctx.drawImage(canvas, 0, currentPage * pageHeight, imgWidth, currentSliceHeight, 0, 0, imgWidth, currentSliceHeight);
        }
        const sliceData = sliceCanvas.toDataURL('image/png');
        const currentScaledHeight = currentSliceHeight * scale;
        pdf.addImage(sliceData, 'PNG', 0, 0, pdfPageWidth, currentScaledHeight);
        heightLeft -= pageHeight;
        currentPage++;
      }

      this.toggleSeparadores(true);
      const nombreArchivo = 'diagrama de flujo ' + this.procedimiento + '.pdf';

      if (!guardarSolo) {
        pdf.save(nombreArchivo);
        this.alertService.infoExito('PDF exportado correctamente');
      }

      // Retornar base64 sin el prefijo data:application/pdf;base64,
      return pdf.output('datauristring').split(',')[1];
    } catch (error) {
      this.toggleSeparadores(true);
      console.error('Error exportando PDF', error);
      alert('Error al exportar PDF');
      return null;
    }
  }

  // 👇 Nuevo método para generar imágenes por página
  async generarImagenesPorPagina(): Promise<string[]> {
    try {
      this.toggleSeparadores(false);
      const canvas = await htmlToImage.toCanvas(this.canvasRef.nativeElement, { fontEmbedCSS: '' });
      const imgWidth = canvas.width;
      const totalHeight = canvas.height;

      // Misma lógica de altura de página que el PDF
      const pageHeight = Math.floor(imgWidth * 1.4142);

      let heightLeft = totalHeight;
      let currentPage = 0;

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = imgWidth;
      sliceCanvas.height = pageHeight;
      const ctx = sliceCanvas.getContext('2d');

      const imagenes: string[] = [];

      while (heightLeft > 0) {
        if (ctx) ctx.clearRect(0, 0, imgWidth, pageHeight);
        const currentSliceHeight = Math.min(pageHeight, heightLeft);

        // Dibujamos la porción correspondiente del canvas original
        if (ctx) {
          ctx.drawImage(canvas, 0, currentPage * pageHeight, imgWidth, currentSliceHeight, 0, 0, imgWidth, currentSliceHeight);
        }

        const sliceData = sliceCanvas.toDataURL('image/png');
        imagenes.push(sliceData);

        heightLeft -= pageHeight;
        currentPage++;
      }

      this.toggleSeparadores(true);
      return imagenes;

    } catch (error) {
      this.toggleSeparadores(true);
      console.error('Error generando imágenes por página', error);
      return [];
    }
  }

  private obtenerTexto(defaultLabel: string): string {
    return this.textoNodo.trim() || `${defaultLabel} ${this.contador}`;
  }

  async guardarDiagrama() {
    // 1. Generar PDF principal
    const pdfBase64 = await this.exportarPDF(true);
    if (!pdfBase64 || !this.documentoId) {
      this.alertService.error('No se pudo generar el PDF o no hay documento asociado');
      return;
    }

    // 2. Generar imágenes por página
    const imagenes = await this.generarImagenesPorPagina();

    // Sanitizar el nombre del procedimiento para evitar caracteres inválidos en el nombre del archivo
    const procedimientoSanitizado = this.procedimiento().replace(/[/\\?%*:|"<>]/g, '-');
    const nombreArchivo = 'diagrama de flujo ' + procedimientoSanitizado + '.pdf';

    console.log('🚀 Intentando guardar diagrama:', {
      documentoId: this.documentoId(),
      procedimiento: this.procedimiento(),
      nombreArchivo: nombreArchivo,
      cantidadImagenes: imagenes.length
    });

    const jsonDiagrama: any = this.graph.toJSON();
    // 👉 PERSISTIR ALTURA DEL PAPER
    jsonDiagrama.paperHeight = this.paper.options.height;

    // 👉 ORDENAR CELDAS: Elementos primero, luego links
    if (jsonDiagrama.cells && Array.isArray(jsonDiagrama.cells)) {
      const elementsSlice = jsonDiagrama.cells.filter((c: any) => !c.type.includes('Link'));
      const linksSlice = jsonDiagrama.cells.filter((c: any) => c.type.includes('Link'));

      jsonDiagrama.cells = [...elementsSlice, ...linksSlice];

      jsonDiagrama.cells.forEach((cell: any) => {
        const item = this.graph.getCell(cell.id);
        if (!item) return;

        // 👉 1. Guardar SIEMPRE el markup (Crítico para JointJS 3.x para renderizar desde JSON)
        const constructor = (item.constructor as any);
        const markup = constructor.prototype?.markup || constructor.markup;
        if (markup) cell.markup = markup;

        if (item.isElement()) {
          const element = item as joint.dia.Element;

          if (!cell.attrs) cell.attrs = {};
          if (!cell.attrs.body) cell.attrs.body = {};

          if (cell.type === 'standard.Path' || (cell.type.includes('Path'))) {
            cell.attrs.body.refD = element.attr('body/refD');
          } else if (cell.type.includes('Polygon')) {
            cell.attrs.body.refPoints = element.attr('body/refPoints');
          }

          cell.attrs.body.stroke = element.attr('body/stroke') || '#000000';
          cell.attrs.body.fill = element.attr('body/fill') || '#FFFFFF';
          cell.attrs.body.strokeWidth = element.attr('body/strokeWidth') || 0.7;
          cell.attrs.body.shapeRendering = 'geometricPrecision';

          if (!cell.attrs.label) cell.attrs.label = {};
          cell.attrs.label.textVerticalAnchor = element.attr('label/textVerticalAnchor') || 'middle';
          cell.attrs.label.refY = element.attr('label/refY') || '50%';

          const tipo = element.prop('tipo');
          if (tipo) cell.tipoCustom = tipo;

        } else if (item.isLink()) {
          const link = item as joint.dia.Link;
          if (cell.type === 'link') cell.type = 'standard.Link';

          if (!cell.attrs) cell.attrs = {};
          if (!cell.attrs.line) cell.attrs.line = {};

          cell.attrs.line.stroke = link.attr('line/stroke') || '#000000';
          cell.attrs.line.strokeWidth = link.attr('line/strokeWidth') || 1;
          cell.attrs.line.targetMarker = link.attr('line/targetMarker') || { 'type': 'path', 'd': 'M 10 -5 0 0 10 5 Z' };
          cell.attrs.line.shapeRendering = 'geometricPrecision';

          const labels = link.labels();
          if (labels && labels.length > 0) cell.labels = labels;

          // 👉 REFUERZO: Asegurar que el source/target tengan IDs válidos pero PRESERVAR metadata (anchors, ports)
          // No sobreestructuramos el objeto completo para no perder la info de anclaje (center, boundary, etc.)
          if (!cell.source || !cell.source.id) {
            cell.source = link.source();
          }
          if (!cell.target || !cell.target.id) {
            cell.target = link.target();
          }

          // 👉 Guardar configuración de router y connector explicitamente
          cell.router = link.router() || { name: 'orthogonal' };
          cell.connector = link.connector() || { name: 'rounded' };
        }
      });
    }

    console.log('💾 Guardando JSON del diagrama:', {
      procedimiento: this.procedimiento,
      totalCeldas: jsonDiagrama.cells?.length || 0,
      links: jsonDiagrama.cells?.filter((c: any) => c.type.includes('Link')).length
    });

    const data = {
      pdf_diagrama: pdfBase64,
      json_diagrama: jsonDiagrama as JsonDiagrama,
      documento_diagrama: nombreArchivo,
      imagenes: imagenes
    };

    // Compartir imagen localmente para otros componentes (ej: Reglamento)
    this.diagramaFlujoService.guardarImagen(pdfBase64);

    this.diagramaFlujoService.guardarDiagramaCompleto(this.documentoId()!, data).subscribe({
      next: (res) => {
        this.alertService.infoExito('Diagrama de flujo Guardado');
        this.diagramaEnviado.emit(true);
      },
      error: (err) => {
        console.error('Error al guardar diagrama:', err);
        this.alertService.error('Error al guardar el diagrama en el servidor');
      }
    });
  }

  // 👉 Método de seguridad para re-vincular conexiones
  private reconectarLinks(linksJSON: any[]) {
    if (!linksJSON || linksJSON.length === 0) return;
    const validLinks: joint.dia.Link[] = [];
    /* START ATOMIC LOGIC */
    linksJSON.forEach(linkData => {
      try {
        const sourceId = linkData.source?.id;
        const targetId = linkData.target?.id;
        if (!sourceId || !targetId) return;
        const sourceEl = this.graph.getCell(sourceId);
        const targetEl = this.graph.getCell(targetId);
        if (sourceEl && targetEl) {
          const link = new joint.shapes.standard.Link({ id: linkData.id });
          if (linkData.attrs) link.attr(linkData.attrs);
          if (linkData.labels) link.labels(linkData.labels);
          if (linkData.router) link.router(linkData.router);
          if (linkData.connector) link.connector(linkData.connector);
          link.source({ id: sourceId });
          link.target({ id: targetId });
          validLinks.push(link);
        }
      } catch (e) {
        console.error('❌ [RECONECTAR] Error preparando link:', linkData.id, e);
      }
    });

    if (validLinks.length > 0) {
      console.log(`🔧 [RECONECTAR] Añadiendo ${validLinks.length} links al grafo...`);
      this.graph.addCells(validLinks);
      validLinks.forEach(link => {
        const view = link.findView(this.paper);
        if (view) {
          (view as any).update();
          if (typeof (view as any).requestConnectionUpdate === 'function') (view as any).requestConnectionUpdate();
        }
      });
      console.log('✅ [RECONECTAR] Batch de links completado.');
    }
  }
}

