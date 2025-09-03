import { FormularioDAACService } from './../../../shared/servicios/formulario-daac.service';
import { Component, signal } from '@angular/core';
import { FormreutilizableComponent } from '../../../shared/component/formreutilizable/formreutilizable.component';
import { TablaprocedimientoComponent } from '../../../shared/component/tablaprocedimiento/tablaprocedimiento.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


@Component({
  selector: 'app-documentacion-soporte',
  imports: [FormreutilizableComponent, TablaprocedimientoComponent, CommonModule, FormsModule],
  templateUrl: './documentacion-soporte.component.html',
  styleUrl: './documentacion-soporte.component.css'
})
export class DocumentacionSoporteComponent {
  nuevoDato: string = '';
  datosDocumentoBase: any[] = [];
  ultimoRegistro: any = {};
  editarformulario: any = null;
  datosDAAC: any[] = []; // guardar los datos del formulario 
  DescripcionDAAC = " Formulario División de Autoevaluación y Acreditación de la Calidad (DAAC)"
  mostrarFormulario = signal(true);
  mostrarbase = signal(false);
  mostrarbotones = signal(false);

  camposMultiplesDAAC = [
    'Proveedores',
    'Insumos',
    'Resultados',
    'Requisitos legales',
    'Documentos',
    'Registros'
  ];

  // Datos del formulario DAAC  
  columnasDAAC = [
    { key: 'Objetivo', label: 'Objetivo' },
    { key: 'Alcance', label: 'Alcance' },
    { key: 'Responsable', label: 'Responsable' },
    { key: 'Proveedores', label: 'Proveedores' },
    { key: 'Insumos', label: 'Insumos' },
    { key: 'Resultados', label: 'Resultados' },
    { key: 'Requisitos legales', label: 'Requisitos legales' },
    { key: 'Documentos', label: 'Documentos a realizar' },
    { key: 'Registros', label: 'Registros a realizar' },
    { key: 'Indicador', label: 'Indicador' },
  ];

  constructor(private formularioDAACService: FormularioDAACService) { }

  ngOnInit() {
    this.formularioDAACService.formularioDAAC$.subscribe(data => {
      this.datosDAAC = data;
    });
  }

  editar(dato: any) {
    this.editarformulario = dato;
    this.mostrarFormulario.set(true);
  }

  //elimina el dato seleccionado y actualiza la tabla service
  eliminar(item: any) {
    this.datosDAAC = this.datosDAAC.filter(p => p !== item);
    this.formularioDAACService.setformularioDAAC(this.datosDAAC);
  }


  guardarDatos(nuevoDato: any) {
    if (this.editarformulario) {
      const index = this.datosDAAC.indexOf(this.editarformulario);
      if (index !== -1) {
        this.datosDAAC[index] = nuevoDato;
      }
      this.editarformulario = null;
    } else {
      this.datosDAAC.push(nuevoDato);
    }

    this.formularioDAACService.setformularioDAAC(this.datosDAAC);

    // ✅ Cerrar formulario y volver a tabla
    this.mostrarFormulario.set(false);
    this.editarformulario = null;
    this.mostrarbase.set(true);
    
  }

  // Datos Documents base
  columnaDocumento = [
    { key: 'Documento', label: 'Documento' }
  ]

  // Agregar datos a tabla de Documentos base
  agregarDato() {
    if (this.nuevoDato.trim()) {
      const nuevo = { Documento: this.nuevoDato.trim() };
      this.datosDocumentoBase
        .push(nuevo);
      this.nuevoDato = ''
      this.mostrarbotones.set(true);
    }
  }

  // Eliminar datos de tabla de documentos base 
  eliminarDato(item: any) {
    this.datosDocumentoBase
      = this.datosDocumentoBase
        .filter(p => p !== item);
  }

  onCancelar() {
    this.mostrarFormulario.set(false);
    this.editarformulario = null;
    
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

    // Datos extra .datosDocumentoBase
    // de Documentos base)
    if (this.datosDocumentoBase
      .length > 0) {
      const filasDocs = this.datosDocumentoBase
        .map(d => [d.Documento]);

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
