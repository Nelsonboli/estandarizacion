import { AlertService } from '../../../shared/Utils/Alertas/alert.service';
import { Component, AfterViewInit, ViewChild, ElementRef, signal, Output, EventEmitter, } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as joint from 'jointjs';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BotonInfo } from '../../../interfaces/botonesInfo';
import { DiagramaService } from '../../../shared/servicios/diagrama.service';


@Component({
  standalone: true,
  selector: 'app-diagrama',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './diagrama.html',
  styleUrl: './diagrama.css'
})
export class Diagrama implements AfterViewInit {
  @Output() diagramaEnviado = new EventEmitter<boolean>()
  @Output() cancelarDiagrama = new EventEmitter<boolean>()
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


  constructor(private diagramaService: DiagramaService,
    private alertService: AlertService,
  ) { }

  // 👇 Propiedades para nuevas funcionalidades
  private selectedElements: joint.dia.Element[] = [];


  // 👇 Control del popover
  popoverVisible = signal(false);
  popoverPos = signal({ x: 0, y: 0 });
  popoverText = signal('');
  currentElement: joint.dia.Element | null = null;

  // 👇 Propiedades para Copiar/Pegar
  private clipboard: any = null;
  contextMenuVisible = signal(false);
  contextMenuPos = signal({ x: 0, y: 0 });


  // 👇 signal para el botón activo
  botonActivo = signal<BotonInfo | null>(null);

  // 👇 Control de posicionamiento secuencial
  private sequentialAdditionCount = 0;
  private lastAdditionTime = 0;

  // 👇 Control del tooltip del sidebar
  sidebarPopoverPos = signal({ x: 0, y: 0 });

  mostrarTooltip(event: MouseEvent, boton: BotonInfo) {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.sidebarPopoverPos.set({
      x: rect.right + 30, // 10px a la derecha del botón
      y: rect.top
    });
    this.botonActivo.set(boton);
  }

  ocultarTooltip() {
    this.botonActivo.set(null);
  }

  // 👇 lista de botones con metadata
  botones: BotonInfo[] = [
    {
      nombre: 'Actividad',
      titulo: 'Actividad',
      descripcion: 'Representa la actividad que se lleva a cabo para el desarrollo correcto del Procedimiento.',
      imagen: 'assets/simbolos/actividad.svg',
      accion: () => this.agregarActividad()
    },
    {
      nombre: 'Responsable',
      titulo: 'Responsable',
      descripcion: 'Indica qué funcionario o qué dependencia es responsable de llevar a cabo la actividad mencionada.',
      imagen: 'assets/simbolos/responsable.svg',
      accion: () => this.agregarResponsable()
    },
    {
      nombre: 'Inicio - Fin',
      titulo: 'Inicio / Fin',
      descripcion: 'Se utiliza para marcar el inicio y fin de las actividades.',
      imagen: 'assets/simbolos/inicio_fin.svg',
      accion: () => this.agregarInicioFin()
    },
    {
      nombre: 'Decisión',
      titulo: 'Decisión',
      descripcion: 'Forma utilizada para determinar qué hacer cuando se presenta una toma de decisiones dentro de la actividad planteada. ',
      imagen: 'assets/simbolos/decision.svg',
      accion: () => this.agregarDecision()
    },
    {
      nombre: 'Observación',
      titulo: 'Observación',
      descripcion: 'Hace referencia a la descripción de actividades, observaciones o datos que se requieran para hacer más comprensible el procedimiento.',
      imagen: 'assets/simbolos/observacion.svg',
      accion: () => this.agregarObservacion()
    },
    {
      nombre: 'Conector de Página',
      titulo: 'Conector de Página',
      descripcion: 'Usado para enlazar el flujo entre diferentes páginas.',
      imagen: 'assets/simbolos/conector_pagina.svg',
      accion: () => this.agregarConectorPagina()
    },
    {
      nombre: 'Conector de Página',
      titulo: 'Conector de Página',
      descripcion: 'Cuando el diagrama de flujo del procedimiento es más extenso que una página, se utiliza para indicar la conexión a la pagina siguiente.',
      imagen: 'assets/simbolos/conector_pentagono.svg',
      accion: () => this.agregarConectorFueraDePagina()
    },

    {
      nombre: 'Documento',
      titulo: 'Documento',
      descripcion: 'Cuando la actividad realizada genera un documento se utiliza este símbolo.',
      imagen: 'assets/simbolos/documento.svg',
      accion: () => this.agregarDocumento()
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
    this.currentPaperHeight = this.obtenerPageHeight();
    this.eliminarElementoConTecla();
    this.paper = new joint.dia.Paper({
      el: this.canvasRef.nativeElement,
      model: this.graph,
      width: 825,
      gridSize: 1,
      drawGrid: true,
      height: this.currentPaperHeight,
      background: {
        color: '#ffffff',
      },
      defaultRouter: { name: 'manhattan' },
      defaultConnector: { name: 'rounded' },

    });

    // Eventos de interacción (Selection & Connection)
    this.paper.on('element:pointerclick', (elementView: any) => {
      this.contextMenuVisible.set(false);
      const cell = elementView.model;
      if (cell.isElement()) {
        const element = cell as joint.dia.Element;

        // 1. Manejo de selección y popover (solo si NO estamos conectando)
        if (!this.modoConexion) {
          this.currentElement = element;
          this.popoverVisible.set(true);
          const text = this.currentElement.attr('label/text');
          this.popoverText.set(typeof text === 'string' ? text : '');
          this.actualizarPosPopover(elementView);
        } else if (this.modoConexion && this.nodoOrigen && this.nodoOrigen.id === element.id) {
          // 👇 REQUERIMIENTO 1: Si vuelvo a dar clic en el nodo origen, quito el modo conexión y muestro popover
          this.modoConexion = false;
          this.nodoOrigen = null;
          this.popoverVisible.set(true);
          const text = element.attr('label/text');
          this.popoverText.set(typeof text === 'string' ? text : '');
          this.actualizarPosPopover(elementView);
          this.seleccionarElemento(element, 'click'); // Volver a rojo/selección normal
          return;
        }

        // 2. Lógica de selección visual
        this.seleccionarElemento(element, 'click');

        // 3. Lógica de conexión (si ya estaba activo el modo)
        if (this.modoConexion && this.nodoOrigen) {
          const nodoDestino = element;
          if (this.nodoOrigen.id !== nodoDestino.id) {
            const link = new joint.shapes.standard.Link();
            link.source(this.nodoOrigen, {
              anchor: { name: 'center' },
              connectionPoint: { name: 'boundary' }
            });
            link.target(nodoDestino, {
              anchor: { name: 'center' },
              connectionPoint: { name: 'boundary' }
            });
            // Router manhattan para que sea dinámico y ortogonal
            link.router('orthogonal', {
              step: 10,
              padding: 10
            });
            link.connector('rounded');

            // 👇 NUEVO: Si el destino es una observación, poner línea punteada
            const isObservation = nodoDestino.prop('tipo') === 'observacion';
            const isObservationOrigen = this.nodoOrigen.prop('tipo') === 'observacion';
            if (isObservation) {
              link.attr({
                line: {
                  strokeDasharray: '5,5',
                  targetMarker: {
                    'type': 'none'
                  }
                }
              });
              // Apuntar específicamente al lado izquierdo donde está el corchete
              link.target(nodoDestino, {
                anchor: { name: 'left', args: { dx: 0 } },
                connectionPoint: { name: 'boundary' }
              });
            }
            if (isObservationOrigen) {
              link.attr({
                line: {
                  strokeDasharray: '5,5',
                  targetMarker: {
                    'type': 'none'
                  }
                }
              });
              // Apuntar específicamente al lado izquierdo donde está el corchete
              link.target(nodoDestino, {
                anchor: { name: 'center' },
                connectionPoint: { name: 'boundary' }
              });
            }

            link.addTo(this.graph);
            this.modoConexion = false;
            this.nodoOrigen = null;
            this.limpiarSeleccion(this.currentElement!); // Limpiar el azul/rojo
            // 👇 REQUERIMIENTO 2: En vez de poner rojo, se coloca VERDE
            this.seleccionarElemento(element, 'target');
          }
        }
      }
    });

    // ⚡ Doble Clic para INICIAR conexión
    this.paper.on('element:pointerdblclick', (elementView: any) => {
      this.contextMenuVisible.set(false);
      const element = elementView.model as joint.dia.Element;
      this.modoConexion = true;
      this.nodoOrigen = element;
      this.seleccionarElemento(element, 'dblclick'); // Poner azul
      this.popoverVisible.set(false); // <--- Cierra el popover al hacer doble clic (azul)
      this.alertService.infoInformacion('Seleccione el destino');
    });
    this.paper.on('link:pointerclick', (linkView: any) => {
      const link = linkView.model as joint.dia.Link;
      this.seleccionarLink(link);
    });
    this.paper.on('blank:pointerdown', (evt: any, x: number, y: number) => {
      // Limpiar selección previa
      this.limpiarTodo();
      // Iniciamos selección si es click izquierdo (o derecho si se prefiere mantener ambos, 
      // pero el requerimiento pide "clic izquierdo seleccionado ... mover mouse")
      this.iniciarSeleccionArea(x, y);
    });
    this.paper.on('blank:pointermove', (evt: any, x: number, y: number) => {
      if (this.isSelecting) {
        this.actualizarSeleccionArea(x, y);
      }
    });

    this.paper.on('blank:pointerup', (evt: any) => {
      if (this.isSelecting) {
        this.terminarSeleccionArea();
      }
    });

    // Prevenir menú contextual del navegador
    this.canvasRef.nativeElement.addEventListener('contextmenu', (e: Event) => {
      e.preventDefault();
    });

    // 🖱️ Menú Contextual para Elementos (Click Derecho)
    this.paper.on('element:contextmenu', (elementView: any, evt: joint.dia.Event, x: number, y: number) => {
      evt.preventDefault();
      const element = elementView.model as joint.dia.Element;

      // 1. Seleccionar el elemento (marcar en rojo solo para clic derecho)
      this.seleccionarElemento(element, 'right-click');

      // 2. Posicionar menú contextual (coordenadas locales del paper)
      this.contextMenuPos.set({ x, y });
      this.contextMenuVisible.set(true);
      this.popoverVisible.set(false);
    });

    this.paper.on('blank:pointerclick', () => {
      // Se maneja mas arriba con pointerdown para diferenciar clicks
    });

    // Detectar fin de movimiento para actualizar popover
    this.paper.on('cell:pointerup', (cellView: any) => {
      const cell = cellView.model;
      if (cell && cell.isElement() && this.currentElement?.id === cell.id) {
        this.actualizarPosPopover(cellView as joint.dia.ElementView);
      }
    });

    // Recalcular al hacer scroll en el main 
    window.addEventListener('scroll', () => {
      if (this.currentElement && this.popoverVisible()) {
        const view = this.paper.findViewByModel(this.currentElement);
        if (view && view instanceof joint.dia.ElementView) this.actualizarPosPopover(view);
      }
      if (this.contextMenuVisible()) this.contextMenuVisible.set(false);
    }, true);

    // Evento para mover múltiples elementos seleccionados
    (this.graph as any).on('change:position', (cell: joint.dia.Cell, newPos: any, options: any) => {
      // Evitar bucle infinito si el movimiento lo causamos nosotros
      if (options.multiMove) return;

      if (cell.isElement()) {
        const element = cell as joint.dia.Element;
        // Si el elemento movido es parte de la selección múltiple
        if (this.selectedElements.some(el => el.id === element.id)) {
          const previousPos = (element as any).previous('position') as any;
          // Calcular delta
          const dx = newPos.x - previousPos.x;
          const dy = newPos.y - previousPos.y;
          // Mover los demás
          this.selectedElements.forEach(el => {
            if (el.id !== element.id) {
              const p = el.position();
              el.position(p.x + dx, p.y + dy, { multiMove: true });
            }
          });
        }
      }
    });

    // 🖱️ Menú Contextual para el CANVAS (Click Derecho)
    this.paper.on('blank:contextmenu', (evt: joint.dia.Event, x: number, y: number) => {
      evt.preventDefault();
      this.contextMenuPos.set({ x, y });
      this.contextMenuVisible.set(true);
      this.popoverVisible.set(false);
    });

    // Cerrar menú contextual al hacer clic fuera
    this.paper.on('blank:pointerdown', () => {
      this.contextMenuVisible.set(false);
    });
  }

  private seleccionarElemento(element: joint.dia.Element, tipo: 'click' | 'dblclick' | 'target' | 'right-click') {
    // Si cambio de selección, limpio lo anterior
    if (this.selectedElement && this.selectedElement.id !== element.id) {
      this.limpiarSeleccionElemento(this.selectedElement);
    }

    // Limpio selección de link si había
    if (this.selectedLink) {
      this.limpiarSeleccionLink(this.selectedLink);
      this.selectedLink = null;
    }

    // Limpiar selección múltiple anterior (si existe)
    if (this.selectedElements.length > 0) {
      this.selectedElements.forEach(el => {
        // Evitarnos limpiarnos a nosotros mismos antes de re-pintar
        if (el.id !== element.id) this.limpiarSeleccionElemento(el);
      });
      // Reiniciamos la lista, ya que ahora es selección única
      this.selectedElements = [];
    }


    //Aplicar estilo según tipo de interacción
    if (tipo === 'click') {
      this.seleccionElemento(element);
    } else if (tipo === 'dblclick') {
      this.seleccionDobleClic(element);
    } else if (tipo === 'target') {
      this.seleccionDestino(element);
    } else if (tipo === 'right-click') {
      this.seleccionClicDerecho(element);
    }
    //Actualizar referencia
    this.selectedElement = element;
  }

  private seleccionarLink(link: joint.dia.Link) {
    if (this.selectedLink && this.selectedLink.id !== link.id) {
      this.limpiarSeleccionLink(this.selectedLink);
    }
    if (this.selectedElement) {
      this.limpiarSeleccionElemento(this.selectedElement);
      this.selectedElement = null;
    }

    link.attr({
      line: {
        stroke: '#ff0000',
        strokeWidth: 1
      }
    });
    this.selectedLink = link;
  }

  private limpiarTodo() {
    this.contextMenuVisible.set(false);
    this.popoverVisible.set(false);
    this.currentElement = null;
    if (this.selectedElement) {
      this.limpiarSeleccionElemento(this.selectedElement);
      this.selectedElement = null;
    }
    if (this.selectedLink) {
      this.limpiarSeleccionLink(this.selectedLink);
      this.selectedLink = null;
    }
    // Limpiar selección múltiple
    this.selectedElements.forEach(el => this.limpiarSeleccionElemento(el));
    this.selectedElements = [];

    this.modoConexion = false;
    this.nodoOrigen = null;
  }

  private limpiarSeleccionLink(link: joint.dia.Link) {
    link.attr({
      line: {
        stroke: '#333333', // Color por defecto
        strokeWidth: 1
      }
    });
  }

  // Renombrado para claridad interna, aunque el método original era 'limpiarSeleccion'
  private limpiarSeleccionElemento(element: joint.dia.Element) {
    const isObservacion = element.prop('tipo') === 'observacion';
    element.attr({
      body: {
        stroke: '#000',
        strokeWidth: isObservacion ? 2 : 1
      }
    });
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
      this.seleccionDobleClic(el); // Azul
    });

    if (this.selectedElements.length > 0) {
      this.alertService.infoInformacion(`${this.selectedElements.length} Elementos seleccionados`);
    }
  }

  private seleccionDobleClic(element: joint.dia.Element) {
    const isObservacion = element.prop('tipo') === 'observacion';
    element.attr({
      body: {
        stroke: '#2563eb',
        strokeWidth: isObservacion ? 2 : 1
      }
    });
  }

  private seleccionElemento(element: joint.dia.Element) {
    const isObservacion = element.prop('tipo') === 'observacion';
    element.attr({
      body: {
        stroke: '#000000', // Negro (original)
        strokeWidth: isObservacion ? 1 : 1
      }
    });
  }

  private seleccionClicDerecho(element: joint.dia.Element) {
    const isObservacion = element.prop('tipo') === 'observacion';
    element.attr({
      body: {
        stroke: '#ff0000', // Rojo (red-500)
        strokeWidth: isObservacion ? 1 : 1
      }
    });
  }

  private seleccionDestino(element: joint.dia.Element) {
    const isObservacion = element.prop('tipo') === 'observacion';
    element.attr({
      body: {
        stroke: '#22c55e', // Verde (green-500)
        strokeWidth: isObservacion ? 1 : 1
      }
    });
  }

  private limpiarSeleccion(element: joint.dia.Element) {
    this.limpiarSeleccionElemento(element);
  }

  private actualizarPosPopover(view: joint.dia.ElementView) {
    const bbox = view.getBBox();
    // BBox ya son coordenadas locales del paper. 
    // Como el contenedor es relativo, posicionamos absolutamente usando estas mismas coordenadas.
    this.popoverPos.set({
      x: bbox.x + (bbox.width / 2) - 100, // Centrado horizontal
      y: bbox.y - 120 // Un poco arriba del elemento
    });
  }
  private eliminarelemento() {
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

  // 👉 Escucha teclas globales
  eliminarElementoConTecla() {
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      // 👉 No borrar si estoy escribiendo en input/textarea
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (this.selectedLink) {
          this.selectedLink.remove();
          this.selectedLink = null;
          this.alertService.infoEliminar('Conexión eliminada');
        } else if (this.selectedElements.length > 0) {
          const count = this.selectedElements.length;
          this.selectedElements.forEach(el => el.remove());
          this.selectedElements = [];
          this.selectedElement = null;
          this.currentElement = null;
          this.popoverVisible.set(false);
          this.alertService.infoEliminar(`${count} elementos eliminados`);
        } else if (this.selectedElement) {
          this.eliminarelemento();
        }
      }

      // 📋 ATAJOS: Ctrl + C / Ctrl + V
      if (event.ctrlKey && event.key === 'c') {
        this.copiarElementos();
      }
      if (event.ctrlKey && event.key === 'v') {
        this.pegarElementos();
      }
    });
  }

  // 👉 Método que se llama desde el botón del popover
  eliminarConBoton() {
    this.eliminarelemento();
    this.alertService.infoEliminar('Elemento eliminado');
  }

  // 📋 Lógica de Copiar / Pegar
  copiarElementos() {
    this.clipboard = [];
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
        sourceId: link.source().id,
        targetId: link.target().id,
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
        element = new joint.shapes.standard.Circle();
      } else if (data.type === 'standard.Ellipse') {
        element = new joint.shapes.standard.Ellipse();
      } else if (data.type === 'standard.Rectangle') {
        element = new joint.shapes.standard.Rectangle();
      } else if (data.type === 'standard.Polygon') {
        element = new joint.shapes.standard.Polygon();
      } else if (data.type === 'standard.Path') {
        element = new joint.shapes.standard.Path();
      } else {
        element = new joint.shapes.standard.Rectangle();
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
    this.selectedElements.forEach(el => this.seleccionDobleClic(el));
    this.alertService.infoExito(`${nuevosElementos.length} Elementos pegados`);
  }
  guardarPopover() {
    if (this.currentElement) {
      const nuevoTexto = this.popoverText();
      this.currentElement.attr('label/text', nuevoTexto);
      this.ajustarTamanoElemento(this.currentElement, nuevoTexto);
    }
    this.popoverVisible.set(false);
  }

  // 📏 Ajuste dinámico de tamaño según texto
  // 📏 Ajuste dinámico de tamaño según texto
  private ajustarTamanoElemento(element: joint.dia.Element, texto: string) {
    const isObservacion = element.prop('tipo') === 'observacion';

    // Configuración base
    const minHeight = isObservacion ? 40 : 60;
    const padding = 20;
    const charWidth = 8;
    const lineHeight = 16;

    // Cálculo aproximado de altura basado en el texto
    // Para la observación, el ancho del texto es fijo (250px aprox)
    const textWidth = isObservacion ? 250 : Math.max(100, (Math.sqrt(texto.length) * 15));

    const lines = texto.split('\n');
    let estimatedHeight = 0;
    lines.forEach(line => {
      // Si la línea es más larga que el ancho, se envolverá
      const lineWraps = Math.ceil((line.length * charWidth) / textWidth);
      estimatedHeight += lineWraps * lineHeight;
    });

    const finalHeight = Math.max(minHeight, estimatedHeight + padding);

    if (isObservacion) {
      // El corchete mantiene su ancho fijo de 10px, solo crece en alto
      element.resize(10, finalHeight);
      element.attr('label/textWrap', {
        width: 250,
        height: null,
        ellipsis: true
      });
    } else {
      const finalWidth = textWidth + padding;
      element.resize(finalWidth, finalHeight);
      element.attr('label/textWrap', {
        width: -10,
        height: null,
        ellipsis: true
      });
    }
  }

  activarConexion() {
    this.modoConexion = true;
    this.nodoOrigen = null;
  }

  // 🎯 Obtener el centro visible del viewport del paper
  // 🎯 Obtener el centro visible del viewport del paper
  private obtenerCentroVisible(): { x: number, y: number } {
    const parentContainer = this.canvasRef.nativeElement.closest('.overflow-x-auto');
    if (!parentContainer) return { x: 250, y: 300 };

    const rect = parentContainer.getBoundingClientRect();
    const now = Date.now();

    // Si han pasado más de 3 segundos desde la última adición, reseteamos el contador secuencial
    if (now - this.lastAdditionTime > 3000) {
      this.sequentialAdditionCount = 0;
    }

    // El "centro" relativo al contenedor que tiene el scroll
    // Desplazamos más a la izquierda (30% en lugar de 50%) y un poco más abajo del centro (50%)
    const viewCenterX = rect.width * 0.30;
    const viewCenterY = window.innerHeight * 0.5;

    // Obtener la posición real del canvas dentro del área de scroll
    const canvasRect = this.canvasRef.nativeElement.getBoundingClientRect();

    // Calcular x, y locales al paper considerando el centro de lo que el usuario ve
    let localX = viewCenterX - canvasRect.left;
    let localY = viewCenterY - canvasRect.top;

    // Requerimiento: Si agrego otro simbolo se agreue un poco mas abajo y a la DERECHA (cascada)
    localY += (this.sequentialAdditionCount * 40);
    localX += (this.sequentialAdditionCount * 40);

    // Clamping para que no se salga de los bordes del diagrama (ancho fijo 825)
    // Minimizado a la izquierda a 50px y derecha a 750px
    localX = Math.max(80, Math.min(750, localX));

    // Obtener altura actual del paper
    const paperH = this.paper.options.height as number || 2000;
    localY = Math.max(50, Math.min(paperH - 100, localY));

    // Actualizar estados para la siguiente adición
    this.lastAdditionTime = now;
    this.sequentialAdditionCount++;

    return { x: localX, y: localY };
  }

  agregarResponsable() {
    const centro = this.obtenerCentroVisible();
    const circle = new joint.shapes.standard.Circle();
    circle.resize(60, 60);
    circle.position(centro.x - 30, centro.y - 30);
    circle.attr({
      body: {
        fill: '#fff',
        stroke: '#000',
        strokeWidth: 1
      },
      label: {
        text: this.obtenerTexto('Responsable'),
        fill: 'black',
        fontSize: 10
      }
    });
    circle.addTo(this.graph);
    this.contador++;
  }

  agregarInicioFin() {
    const centro = this.obtenerCentroVisible();
    const ellipse = new joint.shapes.standard.Ellipse();
    ellipse.resize(120, 50);
    ellipse.position(centro.x - 60, centro.y - 25);
    ellipse.attr({
      body: { fill: '#fff', stroke: '#000', strokeWidth: 1 },
      label: { text: this.obtenerTexto('Inicio/Fin'), fill: 'black' }
    });
    ellipse.addTo(this.graph);
    this.contador++;
  }

  agregarObservacion() {
    const centro = this.obtenerCentroVisible();
    // Forma de Corchete [ como en la imagen
    const bracket = new joint.shapes.standard.Polygon();
    bracket.position(centro.x - 5, centro.y - 20); // Centramos en Y (alto 40)
    bracket.resize(10, 40);
    bracket.prop('tipo', 'observacion');
    bracket.attr({
      body: {
        refPoints: '0,0  10,0  10,0  0,0  0,10  10,10  10,10  0,10',
        fill: 'none',
        stroke: '#000',
        strokeWidth: 1,

      },
      label: {
        text: this.obtenerTexto('Descripción...'),
        fill: 'black',
        fontSize: 10,
        textAnchor: 'start',
        refX: 10, // Posiciona el texto a la derecha del corchete
        refY: 0.5,
        textVerticalAnchor: 'middle',
      }
    });

    bracket.addTo(this.graph);
    this.ajustarTamanoElemento(bracket, this.obtenerTexto('Descripción...'));
    this.contador++;
  }
  agregarConectorPagina() {
    const centro = this.obtenerCentroVisible();
    const circle = new joint.shapes.standard.Circle();
    circle.resize(40, 40);
    circle.position(centro.x - 20, centro.y - 20);
    circle.attr({
      body: { fill: '#fff', stroke: '#000', strokeWidth: 1 },
      label: { text: this.obtenerTexto('2'), fill: 'black' }
    });
    circle.addTo(this.graph);
    this.contador++;
  }

  agregarConectorFueraDePagina() {
    const centro = this.obtenerCentroVisible();
    const conector = new joint.shapes.standard.Polygon();
    conector.resize(60, 60); // tamaño del símbolo
    conector.position(centro.x - 30, centro.y - 30);

    // Definimos los puntos del pentágono estilo "home plate"
    conector.attr({
      body: {
        refPoints: '0,0 60,0 60,40 30,60 0,40', // pentágono tipo "plato de home"
        fill: '#fff',
        stroke: '#000',
        strokeWidth: 1
      },
      label: {
        text: this.obtenerTexto('Pg'), // aquí puedes poner un número o texto
        fill: 'black',
        fontSize: 10
      }
    });

    conector.addTo(this.graph);
    this.contador++;
  }

  agregarDocumento() {
    const centro = this.obtenerCentroVisible();
    const doc = new joint.shapes.standard.Polygon();
    doc.resize(140, 60);
    doc.position(centro.x - 70, centro.y - 30);
    doc.attr({
      body: {
        refPoints: '0,0 140,0 140,50 100,60 0,60', // borde inferior en curva simulada
        fill: '#fff',
        stroke: '#000',
        strokeWidth: 1
      },
      label: { text: this.obtenerTexto('Documento'), fill: 'black' }
    });
    doc.addTo(this.graph);
    this.contador++;
  }

  agregarActividad() {
    const centro = this.obtenerCentroVisible();
    const rect = new joint.shapes.standard.Rectangle();
    rect.resize(130, 60); // Un poco más alto para texto envuelto
    rect.position(centro.x - 65, centro.y - 30);
    rect.attr({
      body: {
        fill: '#FFFFFF',
        stroke: '#000',
        strokeWidth: 1
      },
      label: {
        text: this.obtenerTexto('Actividad'),
        fill: 'black',
        fontSize: 10,
        textWrap: { width: -10, height: null, ellipsis: true }
      }
    });
    rect.addTo(this.graph);
    this.ajustarTamanoElemento(rect, this.obtenerTexto('Actividad'));
    this.contador++;
  }

  agregarDecision() {
    const centro = this.obtenerCentroVisible();
    const diamond = new joint.shapes.standard.Polygon();
    diamond.resize(120, 80); // Más alargado horizontalmente como en la imagen
    diamond.position(centro.x - 60, centro.y - 40);
    diamond.attr({
      body: {
        refPoints: '50,0 100,50 50,100 0,50',
        fill: '#FFFFFF',
        stroke: '#000',
        strokeWidth: 1
      },
      label: {
        text: this.obtenerTexto('Decisión'),
        fill: 'black',
        fontSize: 10
      }
    });
    diamond.addTo(this.graph);
    this.ajustarTamanoElemento(diamond, this.obtenerTexto('Decisión'));
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
        d: 'M 0 0 H 2000',
        stroke: '#9ca3af',
        strokeWidth: 1,
        strokeDasharray: '5,5',
        fill: 'none'
      },
      label: {
        text: ' Fin de Página ',
        fill: '#6b7280',
        fontSize: 10,
        textVerticalAnchor: 'bottom'
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
    htmlToImage.toPng(this.canvasRef.nativeElement).then(dataUrl => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'diagrama.png';
      a.click();
      this.toggleSeparadores(true);
    }).catch(err => {
      console.error(err);
      this.toggleSeparadores(true);
    });
  }

  async exportarPDF() {
    try {
      this.toggleSeparadores(false);
      const canvas = await htmlToImage.toCanvas(this.canvasRef.nativeElement);
      const imgWidth = canvas.width;
      const totalHeight = canvas.height;

      // Calculamos el pageHeight basado en el ancho real del canvas generado
      // para mantener la proporción A4 exacta
      const pageHeight = Math.floor(imgWidth * 1.4142);

      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfPageWidth = 595.28; // Ancho A4 en pt

      // Calculamos el scale para ajustar el ancho del canvas al ancho del PDF
      const scale = pdfPageWidth / imgWidth;

      let heightLeft = totalHeight;
      let currentPage = 0;

      // Crear canvas temporal para slice
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = imgWidth;
      sliceCanvas.height = pageHeight;
      const ctx = sliceCanvas.getContext('2d');

      while (heightLeft > 0) {
        if (currentPage > 0) pdf.addPage();

        // Limpiar canvas temporal
        if (ctx) ctx.clearRect(0, 0, imgWidth, pageHeight);
        // Calcular altura de este slice (puede ser menor si es el último trozo)
        const currentSliceHeight = Math.min(pageHeight, heightLeft);
        // Dibujar el trozo correspondiente del canvas original en el sliceCanvas
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, currentPage * pageHeight, // Source X, Y
            imgWidth, currentSliceHeight, // Source W, H
            0, 0, // Dest X, Y
            imgWidth, currentSliceHeight // Dest W, H
          );
        }

        const sliceData = sliceCanvas.toDataURL('image/png');

        // Añadir al PDF
        const currentScaledHeight = currentSliceHeight * scale;
        pdf.addImage(sliceData, 'PNG', 0, 0, pdfPageWidth, currentScaledHeight);

        heightLeft -= pageHeight;
        currentPage++;
      }

      pdf.save('diagrama_paginado.pdf');
      this.toggleSeparadores(true);
      this.alertService.infoExito('PDF exportado correctamente');
    } catch (error) {
      this.toggleSeparadores(true);
      console.error('Error exportando PDF', error);
      alert('Error al exportar PDF');
    }
  }

  private obtenerTexto(defaultLabel: string): string {
    return this.textoNodo.trim() || `${defaultLabel} ${this.contador}`;
  }

  guardarDiagrama() {
    htmlToImage.toPng(this.canvasRef.nativeElement).then((dataUrl) => {
      this.diagramaService.guardarImagen(dataUrl);
      this.alertService.infoExito('Diagrama de Flujo Guardado');
      this.diagramaEnviado.emit(true)


    }).catch(err => {
      console.error('Error al guardar diagrama:', err);
    });
  }
}
