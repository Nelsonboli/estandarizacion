import { Component } from '@angular/core';
import { FormreutilizableComponent } from '../../../shared/component/formreutilizable/formreutilizable.component';
import { TablaprocedimientoComponent } from '../../../shared/component/tablaprocedimiento/tablaprocedimiento.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TablaService } from '../../../shared/servicios/tabla.service';

@Component({
  selector: 'app-documentacion-soporte',
  imports: [FormreutilizableComponent, TablaprocedimientoComponent, CommonModule, FormsModule],
  templateUrl: './documentacion-soporte.component.html',
  styleUrl: './documentacion-soporte.component.css'
})
export class DocumentacionSoporteComponent {
  nuevoDato: string = '';
  listaDatos: any[] = [];
  ultimoRegistro: any = {};
  DescripcionDAAC = " Formulario División de Autoevaluación y Acreditación de la Calidad (DAAC)"

  constructor(private tablaService: TablaService,

  ) { }

  // Datos del formulario DAAC  
  formularioDAAC = [
    { key: 'Objetivo', label: 'Objetivo' },
    { key: 'Alcance', label: 'Alcance' },
    { key: 'Responsable', label: 'Responsable' },
    { key: 'Proveedor', label: 'Estado' },
    { key: 'Insumos', label: 'Insumos' },
    { key: 'Resultados', label: 'Resultado' },
    { key: 'Requisitos legales', label: 'Requisitos legales' },
    { key: 'Documentos', label: 'Documentos a realizar' },
    { key: 'Registros', label: 'Registros a realizar' },
  ];

  // Datos Documents base
  columnaDocumento = [
    { key: 'Documento', header: 'Documento' }
  ]

  // Agregar datos a tabla de Documentos base
  agregarDato() {
    if (this.nuevoDato.trim()) {
      const nuevo = { Documento: this.nuevoDato.trim() };
      this.listaDatos.push(nuevo);
      this.nuevoDato = ''
    }
  }

  // Eliminar datos de tabla de documentos base 
  eliminarDato(item: any) {
    this.listaDatos = this.listaDatos.filter(p => p !== item);
  }

  onCancelar() {
    // Evento sin validar
    console.log('Formulario cancelado');
  }

  onEnviar(data: any) {
    console.log('Formulario enviado:', data);
    this.ultimoRegistro = data; // Guardamos los valores
  }

  descargarPDF() {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text(this.DescripcionDAAC, 10, 10);

    // Datos principales del formulario (campos dinámicos)
    const campos = Object.keys(this.ultimoRegistro || {});
    const filas = campos.map(campo => [
      campo,
      Array.isArray(this.ultimoRegistro[campo])
        ? this.ultimoRegistro[campo].join(', ')
        : this.ultimoRegistro[campo]
    ]);

    // Primera tabla
    autoTable(doc, {
      head: [['Campo', 'Valor']],
      body: filas,
      startY: 20,
    });

    // obtener el finalY
    const finalY = (doc as any).lastAutoTable?.finalY || 20;

    // Datos extra (listaDatos de Documentos base)
    if (this.listaDatos.length > 0) {
      const filasDocs = this.listaDatos.map(d => [d.Documento]);

      autoTable(doc, {
        head: [['Documento base']],
        body: filasDocs,
        startY: finalY + 10,
      });
    }

    // Descargar el PDF
    doc.save("formularioDAAC.pdf");
  }
}
