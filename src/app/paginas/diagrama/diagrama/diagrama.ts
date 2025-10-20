import { Component, AfterViewInit, ViewChild, ElementRef, signal, } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as joint from 'jointjs';
import * as htmlToImage from 'html-to-image';
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
  @ViewChild('canvas') canvasRef!: ElementRef;
  textoNodo: string = '';
  private graph = new joint.dia.Graph();
  private paper!: joint.dia.Paper;
  private nodoOrigen: joint.dia.Element | null = null;
  private modoConexion = false;
  private contador = 10;
  private selectedElement: joint.dia.Element | null = null;
  private clickTimer: any = null;

  constructor(private diagramaService: DiagramaService){

  }


  // 👇 Control del popover
  popoverVisible = signal(false);
  popoverPos = signal({ x: 0, y: 0 });
  popoverText = signal('');
  currentElement: joint.dia.Element | null = null;


  // 👇 signal para el botón activo
  botonActivo = signal<BotonInfo | null>(null);

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
     this.eliminarElementoConTecla();
    this.paper = new joint.dia.Paper({
      el: this.canvasRef.nativeElement,
      model: this.graph,
      width: '100%',
      height: '100%',
      gridSize: 10,
      drawGrid: {
        name: 'mesh',
        args: {
          color: '9ca3af',
          thickness: 1,
          scaleFactor: 1,
          majorGrid: {
            color: '#9ca3af',
            thickness: 1.5,
            interval: 5
          }
        }
      },
      background: { color: '#ffffff' }
    });

    let firstElement: joint.dia.Element | null = null;
    let lastClickedElement: joint.dia.Element | null = null;


    // Un solo clic 
    this.paper.on('element:pointerclick', (view: any) => {
      if (this.clickTimer) {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
        return;
      }

      this.clickTimer = setTimeout(() => {
        this.clickTimer = null;

        const model = view.model as joint.dia.Element;
        this.seleccionarElemento(model, 'click');

        // 🔹 Conexión automática
        if (this.modoConexion) {
          if (!this.nodoOrigen) {
            this.nodoOrigen = model;
          } else {
            if (this.nodoOrigen.id !== model.id) {
              const link = new joint.shapes.standard.Link();
              link.source(this.nodoOrigen);
              link.target(model);
              link.addTo(this.graph);
            }
            this.nodoOrigen = null;
            this.modoConexion = false;
           
          }

          return;
        }

       if (!firstElement) {
          firstElement = model;
          lastClickedElement = model;
        } else {
          if (firstElement.id !== model.id) {
            const link = new joint.shapes.standard.Link();
            link.source(firstElement);
            link.target(model);
            link.addTo(this.graph);
          }
          firstElement = null;
          lastClickedElement = model;
        }
      }, 250);
    });


    // Doble clic
    this.paper.on('element:pointerdblclick', (view: any) => {
      if (this.clickTimer) {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
      }

      const model = view.model as joint.dia.Element;
      this.seleccionarElemento(model, 'dblclick');

      if (lastClickedElement && lastClickedElement.id === model.id) {
        firstElement = null;
      }

      this.currentElement = model;
      this.actualizarPosPopover(view);

      this.popoverText.set(model.attr('label/text') || '');
      this.popoverVisible.set(true);
    });

    // deselecciona el elemento cuando toca la pagina
    this.paper.on('blank:pointerclick', () => {
      if (this.selectedElement) {
        this.limpiarSeleccion(this.selectedElement);
        this.popoverVisible.set(false);

         // Reseteo de referencias
        this.currentElement = null;
        this.selectedElement = null;
        this.nodoOrigen = null;
        this.modoConexion = false;
      }
    });

    this.eliminarelemento()
    // Recalcular al hacer scroll en el main
    const scrollContainer = this.canvasRef.nativeElement.parentElement;
    scrollContainer.addEventListener('scroll', () => {
      if (this.currentElement && this.popoverVisible()) {
        const view = this.paper.findViewByModel(this.currentElement);
        if (view && view instanceof joint.dia.ElementView) this.actualizarPosPopover(view);
      }
    });
  }

  private seleccionarElemento(element: joint.dia.Element, tipo: 'click' | 'dblclick') {
    // Limpiar el anterior si no es el mismo
    if (this.selectedElement && this.selectedElement.id !== element.id) {
      this.limpiarSeleccion(this.selectedElement);
    }
    //Aplicar estilo según tipo de interacción
    if (tipo === 'click') {
      this.seleccionElemento(element); // verde
    } else {
      this.seleccionDobleClic(element); // azul
    }
    //Actualizar referencia
    this.selectedElement = element;
  }

  private seleccionDobleClic(element: joint.dia.Element) {
    element.attr({
      body: {
        stroke: '#2563eb',       
        strokeWidth: 2           
      }
    });
  }

  private seleccionElemento(element: joint.dia.Element) {
    element.attr({
      body: {
        stroke: '#ff0000',        
        strokeWidth: 2            
      }
    });
  }

  private limpiarSeleccion(element: joint.dia.Element) {
    element.attr({
      body: {
        stroke: '#000',           
        strokeWidth: 1
      }
    });
  }

  private actualizarPosPopover(view: joint.dia.ElementView) {
    const bbox = view.getBBox();
    const paperOffset = this.canvasRef.nativeElement.getBoundingClientRect();
    this.popoverPos.set({
      x: bbox.x + bbox.width / 5 + paperOffset.left - 80,
      y: bbox.y + paperOffset.top - 80
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

    if ((event.key === 'Delete' || event.key === 'Backspace') && this.selectedElement) {
      this.eliminarelemento();
    }
  });
}

// 👉 Método que se llama desde el botón del popover
eliminarConBoton() {
  this.eliminarelemento();
}
  guardarPopover() {
    if (this.currentElement) {
      this.currentElement.attr('label/text', this.popoverText());
    }
    this.popoverVisible.set(false);
  }

  activarConexion() {
    this.modoConexion = true;
    this.nodoOrigen = null;
  }

  agregarResponsable() {
    const circle = new joint.shapes.standard.Circle();
    circle.resize(60, 60);
    circle.position(100 + this.contador * 20, 100 + this.contador * 20);
    circle.attr({
      body: { fill: '#fff', stroke: '#000', strokeWidth: 1 },
      label: { text: this.obtenerTexto('Responsable'), fill: 'black' }
    });
    circle.addTo(this.graph);
    this.contador++;
  }

  agregarInicioFin() {
    const ellipse = new joint.shapes.standard.Ellipse();
    ellipse.resize(120, 50);
    ellipse.position(150 + this.contador * 20, 100 + this.contador * 20);
    ellipse.attr({
      body: { fill: '#fff', stroke: '#000', strokeWidth: 1 },
      label: { text: this.obtenerTexto('Inicio/Fin'), fill: 'black' }
    });
    ellipse.addTo(this.graph);
    this.contador++;
  }

  agregarObservacion() {
    const obs = new joint.shapes.standard.Rectangle();
    obs.resize(140, 60);
    obs.position(200 + this.contador * 20, 120 + this.contador * 20);

    obs.attr({
      body: {
        // Solo bordes izquierdo, inferior y superior
        fill: '#fff',
        stroke: '#000',
        strokeWidth: 1,
        strokeDasharray: '0', // línea sólida
        rx: 0,
        ry: 0
      },
      label: {
        text: this.obtenerTexto('Observación'),
        fill: 'black',
        fontSize: 12
      }
    });

    // Quitar el lado derecho del rectángulo (simulación con un SVG path)
    obs.attr('body/d', 'M 0 0 H 120 V 60 H 0 Z M 120 0 V 60');
    // Con esto queda abierto por la derecha

    obs.addTo(this.graph);
    this.contador++;
  }
  agregarConectorPagina() {
    const circle = new joint.shapes.standard.Circle();
    circle.resize(40, 40);
    circle.position(250 + this.contador * 20, 150 + this.contador * 20);
    circle.attr({
      body: { fill: '#fff', stroke: '#000', strokeWidth: 1 },
      label: { text: this.obtenerTexto('2'), fill: 'black' }
    });
    circle.addTo(this.graph);
    this.contador++;
  }

  agregarConectorFueraDePagina() {
    const conector = new joint.shapes.standard.Polygon();
    conector.resize(60, 60); // tamaño del símbolo
    conector.position(250 + this.contador * 20, 150 + this.contador * 20);

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
        fontSize: 12
      }
    });

    conector.addTo(this.graph);
    this.contador++;
  }

  agregarDocumento() {
    const doc = new joint.shapes.standard.Polygon();
    doc.resize(140, 60);
    doc.position(300 + this.contador * 20, 200 + this.contador * 20);
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
    const rect = new joint.shapes.standard.Rectangle();
    rect.resize(150, 50);
    rect.position(100 + this.contador * 20, 50 + this.contador * 20);
    rect.attr({
      body: { fill: '#FFFFFF', strokeWidth: 1 },
      label: { text: this.obtenerTexto('Actividad'), fill: 'black' }
    });
    rect.addTo(this.graph);
    this.contador++;
  }

  agregarDecision() {
    const diamond = new joint.shapes.standard.Polygon();
    diamond.resize(100, 100);
    diamond.position(200 + this.contador * 15, 150 + this.contador * 10);
    diamond.attr({
      body: {
        refPoints: '50,0 100,50 50,100 0,50',
        fill: '#FFFFFF',
        strokeWidth: 1
      },
      label: { text: this.obtenerTexto('Decisión'), fill: 'black' }
    });
    diamond.addTo(this.graph);
    this.contador++;
  }

  exportar() {
    htmlToImage.toPng(this.canvasRef.nativeElement).then(dataUrl => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'diagrama.png';
      a.click();
    });
  }

  private obtenerTexto(defaultLabel: string): string {
    return this.textoNodo.trim() || `${defaultLabel} ${this.contador}`;
  }

guardarDiagrama() {
  htmlToImage.toPng(this.canvasRef.nativeElement).then((dataUrl) => {
    this.diagramaService.guardarImagen(dataUrl);
    alert('✅ Diagrama guardado correctamente');
  }).catch(err => {
    console.error('Error al guardar diagrama:', err);
  });
}
}
