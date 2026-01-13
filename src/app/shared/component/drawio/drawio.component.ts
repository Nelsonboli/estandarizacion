import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-drawio',
  imports: [],
  templateUrl: './drawio.component.html',
  styleUrl: './drawio.component.css'
})
export class DrawioComponent {


  @ViewChild('drawioFrame') drawioFrame!: ElementRef<HTMLIFrameElement>;
  private frameWindow: Window | null = null;

  ngAfterViewInit() {
    this.frameWindow = this.drawioFrame.nativeElement.contentWindow;

    window.addEventListener("message", (event) => {
      const msg = event.data;
      if (!msg || !msg.event) return;

      switch (msg.event) {
        case "init":
          console.log("Draw.io inicializado");
          this.registrarShapesPersonalizados();
          this.cargarDiagramaInicial();
          break;

        case "save":
          console.log("Diagrama recibido:", msg.xml);
          this.guardarEnBackend(msg.xml);
          break;

        case "exit":
          console.log("Editor cerrado");
          break;
      }
    });
  }

  // ============================
  // 1. Cargar diagrama inicial
  // ============================
  cargarDiagramaInicial() {
    const xmlVacio = `
      <mxGraphModel dx="827" dy="523" grid="1" gridSize="10" guides="1">
        <root>
          <mxCell id="0"/>
          <mxCell id="1" parent="0"/>
        </root>
      </mxGraphModel>
    `;

    this.enviarMensaje({
      action: "load",
      autosave: 1,
      xml: xmlVacio
    });
  }

  // =======================================
  // 2. Registrar Shapes personalizados
  // =======================================
  registrarShapesPersonalizados() {
    const shapes = [
      { name: "rectangulo", w: 140, h: 60, style: "rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" },
      { name: "circulo", w: 80, h: 80, style: "shape=ellipse;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;" },
      { name: "rombo", w: 120, h: 80, style: "shape=rhombus;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;" },
      { name: "iniciofin", w: 160, h: 70, style: "shape=terminator;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" },
      { name: "descripcion", w: 200, h: 80, style: "whiteSpace=wrap;html=1;strokeColor=#666666;fillColor=#f5f5f5;" },
    ];

    shapes.forEach(s => {
      this.enviarMensaje({
        action: "template",
        name: s.name,
        xml: this.generarShapeXML(s.name, s.w, s.h, s.style)
      });
    });

    console.log("Shapes personalizados registrados");
  }

  private generarShapeXML(name: string, w: number, h: number, style: string) {
    return `
      <mxGraphModel>
        <root>
          <mxCell id="0"/>
          <mxCell id="1" parent="0"/>
          <mxCell id="2" value="${name}" style="${style}" vertex="1" parent="1">
            <mxGeometry x="0" y="0" width="${w}" height="${h}" as="geometry"/>
          </mxCell>
        </root>
      </mxGraphModel>
    `;
  }

  // ========================================
  // 3. Guardar diagrama (POST al backend)
  // ========================================
  guardarEnBackend(xml: string) {
    console.log("Diagrama para guardar:", xml);
    // Aquí llamas tu servicio Angular:
    // this.miServicio.save(xml).subscribe(...)
  }

  // ============================
  // Utilidad para enviar mensajes
  // ============================
  enviarMensaje(data: any) {
    if (this.frameWindow) {
      this.frameWindow.postMessage(data, '*');
    }
  }

  // =====================================================
  // 4. Método para activar el botón Guardar desde Angular
  // =====================================================
  guardar() {
    this.enviarMensaje({ action: "export", format: "xml" });
  }
}
