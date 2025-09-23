import { FormularioDAACService } from './../../../shared/servicios/formulario-daac.service';
import { Component, signal, ChangeDetectorRef } from '@angular/core';
import { FormreutilizableComponent } from '../../../shared/component/formreutilizable/formreutilizable.component';
import { TablaprocedimientoComponent } from '../../../shared/component/tablaprocedimiento/tablaprocedimiento.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AlertService } from '../../../shared/servicios/alert.service';

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
  DescripcionDAAC = "Formulario División de Autoevaluación y Acreditación de la Calidad (DAAC)";

  // signals para controlar UI
  mostrarFormulario = signal(true);
  mostrarbase = signal(false);
  mostrarbotones = signal(false);
  

  columnasDAAC = [
    { key: 'Objetivo', label: 'Objetivo',Tooltip:'Establece el propósito que tiene el Procedimiento.' },
    { key: 'Alcance', label: 'Alcance',Tooltip:' Hace referencia al cubrimiento de las actividades del Procedimiento' },
    { key: 'Responsable', label: 'Responsable', Tooltip:' Determina al (los) funcionario(s) que es (son) responsable(s) de la implementación de las actividades que conforman el Procedimiento' },
    { key: 'Proveedores', label: 'Proveedores', Tooltip:'Son las personas o entidades que proporcionan las entradas para el Procedimiento. ' },
    { key: 'Insumos', label: 'Insumos', Tooltip:'Elementos requeridos para el desarrollo del Procedimiento' },
    { key: 'Resultados', label: 'Resultados', Tooltip:' Producto o servicio que se obtiene del desarrollo del Procedimiento' },
    { key: 'Quien recibe el resultado', label: 'Quien recibe', Tooltip:'Persona o grupo de personas a quienes va dirigida la implementación del Procedimiento' },
    { key: 'Requisitos legales', label: 'Requisitos legales', Tooltip:'Hace referencia a las Normas o Actos Administrativos que indican la necesidad u obligatoriedad del Procedimiento o sus actividades' },
    { key: 'Documentos', label: 'Documentos a realizar', Tooltip:'Información que está evidenciada por medio de un soporte magnético o impreso, estos documentos pueden ser internos o externos a la Universidad ' },
    { key: 'Registros', label: 'Registros a realizar', Tooltip:' Documentos que presentan resultados obtenidos o proporcionan evidencias de actividades desarrolladas.  Los Registros se originan por el diligenciamiento de Formatos' },
    { key: 'Indicador', label: 'Indicador', Tooltip:' Magnitud utilizada para medir o comparar los resultados efectivamente obtenidos, en la ejecución de un proyecto, programa o actividad. Resultado cuantitativo de comparar dos variables' },
    { key: 'Fórmula', label: 'Fórmula', Tooltip:' Modelo establecido para expresar, realizar o resolver algo; en este caso, se refiere al Indicador' },
  ];

  columnaDocumento = [
    { key: 'Documento', label: 'Documento' }
  ];

  constructor(
    private formularioDAACService: FormularioDAACService,
    private cdr: ChangeDetectorRef,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.formularioDAACService.formularioDAAC$.subscribe(data => {
      this.datosDAAC = data;

      // 👇 si ya hay un formulario guardado → mostrar tabla
      if (this.datosDAAC.length > 0) {
        this.mostrarFormulario.set(false);
        this.mostrarbase.set(true);
      } else {
        this.mostrarFormulario.set(true);
        this.mostrarbase.set(false);
      }
    });
  }

  editar(dato: any) {
    this.editarformulario = dato;
    this.mostrarFormulario.set(true);
    this.mostrarbase.set(false);
    this.cdr.detectChanges();
  }

  eliminar(item: any) {
    this.datosDAAC = this.datosDAAC.filter(p => p !== item);
    this.formularioDAACService.setformularioDAAC(this.datosDAAC);

    // 👇 Si ya no hay registros, volvemos a mostrar el formulario
    if (this.datosDAAC.length === 0) {
      this.mostrarFormulario.set(true);
      this.mostrarbase.set(false);
    }
  }

  guardarDatos(nuevoDato: any) {
    // ✅ Validación: máximo un formulario
    if (!this.editarformulario && this.datosDAAC.length > 0) {
      this.alertService.error('Ya existe registro del formulario')
    }

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
    this.ultimoRegistro = nuevoDato;

    // ✅ mostrar tabla y documentos base
    this.mostrarFormulario.set(false);
    this.mostrarbase.set(true);
  }

  agregarDato() {
    if (this.nuevoDato.trim()) {
      const nuevo = { Documento: this.nuevoDato.trim() };
      this.datosDocumentoBase.push(nuevo);
      this.nuevoDato = '';
      this.mostrarbotones.set(true);
    }
  }

  eliminarDato(item: any) {
    this.datosDocumentoBase = this.datosDocumentoBase.filter(p => p !== item);
  }

  onCancelar() {
    this.mostrarFormulario.set(false);
    this.editarformulario = null;
    this.mostrarbase.set(true);
  }

  descargarPDF() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(this.DescripcionDAAC, 10, 10);

    const campos = Object.keys(this.ultimoRegistro || {});
    const filas = campos.map(campo => [
      campo,
      Array.isArray(this.ultimoRegistro[campo])
        ? this.ultimoRegistro[campo].join(', ')
        : this.ultimoRegistro[campo]
    ]);

    autoTable(doc, {
      head: [['Campo', 'Valor']],
      body: filas,
      startY: 20,
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 20;

    if (this.datosDocumentoBase.length > 0) {
      const filasDocs = this.datosDocumentoBase.map(d => [d.Documento]);
      autoTable(doc, {
        head: [['Documento base']],
        body: filasDocs,
        startY: finalY + 10,
      });
    }

    doc.save("FormatoDAAC.pdf");
  }
}
