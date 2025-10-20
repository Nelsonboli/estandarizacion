import { DatosTablaService } from './../../../shared/servicios/datosTablas.service';
import { Diagrama } from '../../../paginas/diagrama/diagrama/diagrama';
import { FormularioDAACService } from './../../../shared/servicios/formulario-daac.service';
import { Component, signal, ChangeDetectorRef, Output, EventEmitter, output } from '@angular/core';
import { FormreutilizableComponent } from '../../../shared/component/formreutilizable/formreutilizable.component';
import { TablaprocedimientoComponent } from '../../../shared/component/tablaprocedimiento/tablaprocedimiento.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AlertService } from '../../../shared/servicios/alert.service';
import { DocumentoBaseService } from './../../../shared/servicios/documento-base.service';

@Component({
  selector: 'app-documentacion-soporte',
  imports: [FormreutilizableComponent, TablaprocedimientoComponent, CommonModule, FormsModule, Diagrama],
  templateUrl: './documentacion-soporte.component.html',
  styleUrl: './documentacion-soporte.component.css'
})
export class DocumentacionSoporteComponent {
  documentoEnviado = output<boolean>();

 
 
  //variables con signals
  datosDAAC = signal<any[]>([]);
  datosDocumentoBase = signal<any[]>([]);
  ultimoRegistro = signal<any>({});
  editarformulario = signal<any | null>(null);
  mensajedeDiagrama: boolean = false;

  // input y edición de documentos base
  nuevoDato = signal('');
  documentoEditando = signal<any | null>(null);

  // signals para controlar UI
  mostrarFormulario = signal(true);
  mostrarbase = signal(false);
  realizarDiagrama = signal(false);
  mostrarDiagrama = signal(false);
  descargarDocumento= signal(false)

  constructor(
    private formularioDAACService: FormularioDAACService,
    private cdr: ChangeDetectorRef,
    private alertService: AlertService,
    public datosTablaService: DatosTablaService,
    public documentoBaseService: DocumentoBaseService
  ) { }

     columnaDocumento = [
    { key: 'Documento', label: 'Documento' }
  ];
 

  ngOnInit() {
    this.formularioDAACService.formularioDAAC$.subscribe(data => {
      this.datosDAAC.set(data);

      if (data.length > 0) {
        this.mostrarFormulario.set(false);
        this.mostrarbase.set(true);
        this.mostrarDiagrama.set(false);
      } else {
        this.mostrarFormulario.set(true);
        this.mostrarbase.set(false);
        this.mostrarDiagrama.set(true);
      }
    });
  }

  // ✅ EDITAR FORMULARIO
  editar(dato: any) {
    this.editarformulario.set(dato);
    this.mostrarFormulario.set(true);
    this.mostrarbase.set(false);
    this.mostrarDiagrama.set(false);
  }

  //Eliminar datos formulario DAAC
  eliminar(item: any) {
    const actualizados = this.datosDAAC().filter(p => p !== item);
    this.datosDAAC.set(actualizados);
    this.formularioDAACService.setformularioDAAC(actualizados);

    if (actualizados.length === 0) {
      this.mostrarFormulario.set(true);
      this.mostrarbase.set(false);
      this.mostrarDiagrama.set(false);
    }
  }

  guardarDatos(nuevoDato: any) {
    let actualizados = [...this.datosDAAC()];
    if (!this.editarformulario() && actualizados.length > 0) {
      this.alertService.error('Ya existe registro del formulario');
      return;
    }
    if (this.editarformulario()) {
      const index = actualizados.indexOf(this.editarformulario());
      if (index !== -1) {
        actualizados[index] = nuevoDato;
      }
      this.editarformulario.set(null);
    } else {
      actualizados.push(nuevoDato);
    }

    this.datosDAAC.set(actualizados);
    this.formularioDAACService.setformularioDAAC(actualizados);
    this.ultimoRegistro.set(nuevoDato);
    this.mostrarFormulario.set(false);
    this.mostrarbase.set(true);
  }

  //CRUD DOCUMENTOS BASE
 agregarDato() {
  if (this.nuevoDato().trim()) {
    if (this.documentoEditando()) {
      const actualizados = this.documentoBaseService.getDocumentosBase().map(doc =>
        doc === this.documentoEditando() ? { Documento: this.nuevoDato().trim() } : doc
      );
      this.documentoBaseService.setDocumentosBase(actualizados);
      this.documentoEditando.set(null);
    } else {
      const nuevo = { Documento: this.nuevoDato().trim() };
      this.documentoBaseService.agregarDocumento(nuevo); 
    }

    this.nuevoDato.set('');
    this.realizarDiagrama.set(true);
  }
}

  eliminarDato(item: any) {
  this.documentoBaseService.eliminarDocumento(item); 
}


  editarDato(item: any) {
    this.nuevoDato.set(item.Documento);   // cargo el valor al input
    this.documentoEditando.set(item);     // guardo la referencia del documento que edito
  }

  onCancelar() {
    this.mostrarFormulario.set(false);
    this.editarformulario.set(null);
    this.mostrarbase.set(true);
  }

  descargarPDF() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(this.datosTablaService.DescripcionDAAC, 10, 10);

    const campos = Object.keys(this.ultimoRegistro() || {});
    const filas = campos.map(campo => [
      campo,
      Array.isArray(this.ultimoRegistro()[campo])
        ? this.ultimoRegistro()[campo].join(', ')
        : this.ultimoRegistro()[campo]
    ]);

    autoTable(doc, {
      head: [['Campo', 'Valor']],
      body: filas,
      startY: 20,
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 20;

    if (this.datosDocumentoBase().length > 0) {
      const filasDocs = this.datosDocumentoBase().map(d => [d.Documento]);
      autoTable(doc, {
        head: [['Documento base']],
        body: filasDocs,
        startY: finalY + 10,
      });
    }

    doc.save("FormatoDAAC.pdf");

    
  }

  abrirDiagrama() {
    this.realizarDiagrama.set(false);
    this.mostrarDiagrama.set(true);
    this.descargarDocumento.set(true);
    this.documentoEnviado.emit(true);
  }

  recibirvalor(valor: boolean) {
    this.mensajedeDiagrama = true;
  }


}
