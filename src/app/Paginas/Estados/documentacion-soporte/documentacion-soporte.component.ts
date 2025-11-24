import { TablaFormularioDAACService, } from '../../../shared/servicios/tabla-formularioDAAC.service';
import { DatosService } from '../../../shared/servicios/datos.service';
import { Diagrama } from '../../../paginas/diagrama/diagrama/diagrama';
import { FormularioDAACService } from './../../../shared/servicios/modulos/formulario-daac.service';
import { Component, signal, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { FormreutilizableComponent } from '../../../shared/component/formreutilizable/formreutilizable.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AlertService } from '../../../shared/Utils/Alertas/alert.service';
import { TablasFormularioComponent } from "../../../shared/component/tablas-formulario/tablas-formulario.component";
import { TablaDatosComponent } from "../../../shared/component/tabla-datos/tabla-datos.component";
import { ReglamentoBaseService } from '../../../shared/servicios/modulos/reglamento-base.service';
import { EstandarizacionService } from '../../../shared/servicios/estandarizacion.service';


@Component({
  selector: 'app-documentacion-soporte',
  imports: [FormreutilizableComponent, CommonModule, FormsModule, Diagrama, TablasFormularioComponent, TablaDatosComponent],
  templateUrl: './documentacion-soporte.component.html',
  styleUrl: './documentacion-soporte.component.css'
})
export class DocumentacionSoporteComponent {
  @Input() procedimientoId!: number;
  @Input() documentoId!: number  ; 
  @Output() documentoEnviado = new EventEmitter<void>();
  form: FormGroup;


  //variables con signals
  datosDAAC = signal<any[]>([]);
  datosDocumentoBase = signal<any[]>([]);
  ultimoRegistro = signal<any>({});
  editarformulario = signal<any | null>(null);
  mensajedeDiagrama: boolean = false;

  // input y edición de documentos base
  nuevoDato = signal('');
  documentoEditando = signal<any | null>(null);
  datosFiltrados: any[] = [];
  mostrarFormularioFlag = false;

  // signals para controlar UI
  mostrarFormulario = signal(true);
  mostrarbase = signal(false);
  realizarDiagrama = signal(false);
  mostrarDiagrama = signal(false);
  descargarDocumento = signal(false)

  constructor(
    private formularioDAACService: FormularioDAACService,
    private tablaFormularioDAACService: TablaFormularioDAACService,
    private ReglamentoBase: ReglamentoBaseService,
    private cdr: ChangeDetectorRef,
    private alertService: AlertService,
    public datosService: DatosService,
    private fb: FormBuilder, 
    private estandarizacionService: EstandarizacionService,
 
  ) { 
    this.form = this.fb.group({
      id_diagrama:[''],
      documento_completado : [false],
    });
  }

  columnaDocumentoBase = [
    { key: 'documento', label: 'documento' }
  ];

  guardar() {
    this.estandarizacionService.guardarDocumentoSoporte(this.procedimientoId, this.form.value)
      .subscribe({
        next: () => {
          this.documentoEnviado.emit();
        },
        error: (err) => console.error('Error al guardar documento soporte', err)
      });
  }

  ngOnInit() {
    this.cargarDocumentosBase();
  
    if (this.documentoId) {
      this.cargarFormularioPorDocumento(this.documentoId);
    } else {
      // intentar obtener documento por procedimiento (por si se creó en otro flujo)
      this.estandarizacionService.obtenerDocumentoPorProcedimiento(this.procedimientoId)
        .subscribe({
          next: (doc) => {
            this.documentoId = doc.id;
            this.cargarFormularioPorDocumento(this.documentoId);
          },
          error: () => {
            // no existe: mostrará el formulario normal y el botón en UI creará el documento.
            console.log('No existe documento para este procedimiento, se mostrará formulario normalmente');
          }
        });
    }
    
    this.ObtenerDatosTablaDAAC()

   this.cargarDatos();
  }

  ObtenerDatosTablaDAAC(){
    
    this.formularioDAACService.getFormularioDAAC().subscribe({
      next: (data) => {
        this.datosDAAC.set(data);
        this.tablaFormularioDAACService.setDatosFormularioDAAC(data);
        console.log("datos de la tabla de formulario", data)
        if (data.length > 0) {
          this.mostrarFormulario.set(false);
          this.mostrarbase.set(true);
          this.mostrarDiagrama.set(false);
        } else {
          this.cargarFormularioPorDocumento(data.length)
          this.tablaFormularioDAACService.setDatosFormularioDAAC(data)
          this.mostrarFormulario.set(true);
          this.mostrarbase.set(false);
          this.mostrarDiagrama.set(false);
        }
      },
      error: () => this.alertService.error('Error al cargar formularios DAAC')
    });
   
  }


  // guardarDatosFormularioDAAC(nuevoDato: any) {
  //   if (this.editarformulario()) {
  //     // Actualizar registro existente
  //     const id = this.editarformulario().id;
  //     this.formularioDAACService.editarFormularioDAAC(id, nuevoDato).subscribe({
  //       next: () => {
  //         this.formularioDAACService.getFormularioDAAC().subscribe(data => {
  //           this.tablaFormularioDAACService.setDatosFormularioDAAC(data);
  //           this.alertService.exito('Formulario actualizado correctamente');
  //         })
  //         this.actualizarLista();
  //         console.log(this.actualizarLista)
  //       },
  //       error: () => this.alertService.error('Error al actualizar el formulario')
  //     });
  //     this.editarformulario.set(null);
  //   } else {
  //     // Crear nuevo registro
  //     this.formularioDAACService.crearFormularioDAAC(nuevoDato).subscribe({
  //       next: () => {
  //         this.alertService.exito('Formulario guardado correctamente');
  //         this.formularioDAACService.getFormularioDAAC().subscribe(data => {
  //           this.tablaFormularioDAACService.setDatosFormularioDAAC(data);
  //         })
  //         this.actualizarLista();
  //       }, error: (err) => {

  //         console.error('Error al guardar procedimiento', err);
  //         this.alertService.error('Error al guardar el formulario');
  //       }
  //     });
  // }

  //   this.mostrarFormulario.set(false);
  //   this.mostrarbase.set(true);
  // }


  cargarFormularioPorDocumento(documentoId: number) {
    this.formularioDAACService.obtenerPorDocumento(documentoId)
      .subscribe({
        next: (form) => {
          if (form) {
            // si existe, muéstralo en la tabla (solo ese)
            this.datosFiltrados = [form];
            this.mostrarFormulario.set(false);
            this.mostrarbase.set(true);
          } else {
            // no hay formulario: mostrar formulario para crear 1:1
            this.datosFiltrados = [];
            this.mostrarFormulario.set(true);
            this.mostrarbase.set(false);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          // si el backend devuelve 404, mostrar formulario
          console.log(err)
          this.datosFiltrados = [];
          this.mostrarFormulario.set(true);
          this.mostrarbase.set(false);
          this.cdr.detectChanges();
        }
      });
  }

  guardarDatosFormularioDAAC(nuevoDato: any) {
    if (this.editarformulario()) {
      // editar caso existente (id incluido)
      const id = this.editarformulario().id;
      this.formularioDAACService.editarFormulario(id, nuevoDato).subscribe({
        next: () => {
          this.alertService.exito('Formulario actualizado correctamente');
          this.cargarFormularioPorDocumento(this.documentoId!);
          this.actualizarLista();
          console.log(this.actualizarLista)
        },
        error: () => this.alertService.error('Error al actualizar el formulario')
      });
      this.editarformulario.set(null);
    } else {
      // creación: requiere documentoId
      if (!this.documentoId) {
        this.alertService.error('Debe crear primero el Documento de Soporte');
        return;
      }
      this.formularioDAACService.crearFormularioConDocumento(this.documentoId, nuevoDato).subscribe({
        next: () => {
          this.alertService.exito('Formulario guardado correctamente');
          this.cargarFormularioPorDocumento(this.documentoId!);
        },
        error: (err) => {
          console.error('Error al guardar formulario', err);
          this.alertService.error('Error al guardar el formulario');
        }
      });
    }
    this.mostrarFormulario.set(false);
    this.mostrarbase.set(true);
  }

cargarDatos() {
  this.formularioDAACService.obtenerPorDocumento(this.documentoId)
    .subscribe({
      next: (data) => {

        console.log("Data enviado a tabla", data)
        console.log("procedimiento enviado:", this.documentoId)
        // convierte null o un objeto en array
        this.datosFiltrados = data ? [data] : [];
        // ahora sí, length nunca falla
        this.mostrarFormularioFlag = this.datosFiltrados.length === 0;
      }
    });
}

  //Eliminar datos formulario DAAC
  eliminarDatoFormularioDAAC(item: any) {
    this.alertService.alertEliminar().then((res) => {
      if (res.isConfirmed) {
        this.formularioDAACService.eliminarFormularioDAAC(item.id).subscribe({
          next: () => {
            // Actualizar correctamente la señal
            this.datosDAAC.update(lista => lista.filter(p => p !== item));

            // Actualizar la tabla con el nuevo valor
            this.tablaFormularioDAACService.setDatosFormularioDAAC(this.datosDAAC());

           
            this.alertService.exito('Formulario eliminado correctamente');
          },
          error: (err) => {
            console.error(err);
            this.alertService.error('No se pudo eliminar el formulario');
          },
        });
      }
    });
  }

  // ✅ EDITAR FORMULARIO
  editarFormulario(dato: any) {
    this.editarformulario.set(dato);
    this.mostrarFormulario.set(true);
    this.mostrarbase.set(false);
    this.mostrarDiagrama.set(false);

    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    this.cargarDocumentosBase();
  }

  
  cargarDocumentosBase() {
  this.ReglamentoBase.getReglamentoBase().subscribe({
    next: (data) => {
      const normalizados = data.map(d => ({
        id: d.id,
        documento: d.documento ?? d.Documento ?? ''   // ← tolerancia por si backend varía
      }));

      this.datosDocumentoBase.set(normalizados);
    },
    error: () => this.alertService.error('Error al cargar documentos base')
  });
}

  // Agregar o editar documento base
  agregarDato() {
    const documento = this.nuevoDato().trim();
    if (!documento) return;

    const nuevoDoc = { documento };

    // Si está editando
    if (this.documentoEditando()) {
      const id = this.documentoEditando().id;
      console.log("el id es:", id);
      this.ReglamentoBase.ActualizarReglamentoBase(id, nuevoDoc).subscribe({
        next: () => {
          this.alertService.exito('Documento base actualizado');
          this.cargarDocumentosBase();
          this.documentoEditando.set(null);
          this.nuevoDato.set('');
        },
        error: () => this.alertService.error('Error al actualizar documento')
      });
    } else {
      // Si es nuevo
      this.ReglamentoBase.CrearReglamentoBase(nuevoDoc).subscribe({
        next: () => {
          this.alertService.exito('Documento base agregado');
          this.cargarDocumentosBase();
          this.nuevoDato.set('');
        },
        error: () => this.alertService.error('Error al agregar documento')
      });
    }

    this.realizarDiagrama.set(true);
  }

  // Eliminar documento base
  eliminarDato(item: any) {
    this.ReglamentoBase.EliminarReglamentoBase(item.id).subscribe({
      next: () => {
        this.alertService.exito('Documento eliminado correctamente');
        this.cargarDocumentosBase();
      },
      error: () => this.alertService.error('Error al eliminar documento')
    });
  }

  // Editar documento base (precarga en el input)
  editarDato(item: any) {
    this.nuevoDato.set(item.documento);
    this.documentoEditando.set(item);
  }

  onCancelar() {
    this.mostrarFormulario.set(false);
    this.editarformulario.set(null);
    this.mostrarbase.set(true);
  }

  descargarPDF() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(this.datosService.DescripcionDAAC, 10, 10);

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
      const filasDocs = this.datosDocumentoBase().map(d => [d.documento]);
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
    this.documentoEnviado.emit();
  }

  recibirvalor(valor: boolean) {
    this.mensajedeDiagrama = true;
  }

  actualizarLista() {
    this.formularioDAACService.getFormularioDAAC().subscribe({
      next: (data) => {
        this.datosDAAC.set(data);
        this.cdr.detectChanges();
      },
      error: () => this.alertService.error('Error al recargar datos')
    });
  }

}
