import { DatosService } from '../../../../../shared/services/datos.service';
import { FormularioDAACService } from '../../../services/formulario-daac.service';
import { Component, signal, ChangeDetectorRef, effect, computed, input, output, inject } from '@angular/core';
import { FormreutilizableComponent } from '../../../../../shared/components/form-reutilizable/form-reutilizable.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AlertService } from '../../../../../shared/services/alert.service';
import { TablasFormularioComponent } from "../../../../../shared/components/tablas-formulario/tablas-formulario.component";
import { TablaDatosComponent } from "../../../../../shared/components/tabla-datos/tabla-datos.component";
import { ReglamentoBaseService } from '../../../services/reglamento-base.service';
import { DocumentoSoporteService } from '../../../services/documento-soporte.service';
import { forkJoin, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TablaFormularioDAACService } from '../../../services/tabla-formulario-daac.service';
import { DiagramaDeFlujo } from '../../diagrama-de-flujo/diagrama-de-flujo';

@Component({
  standalone: true,
  selector: 'app-documentacion-soporte',
  imports: [FormreutilizableComponent, CommonModule, FormsModule, ReactiveFormsModule, TablasFormularioComponent, TablaDatosComponent, DiagramaDeFlujo],
  templateUrl: './documentacion-soporte.component.html',
  styleUrl: './documentacion-soporte.component.css'
})
export class DocumentacionSoporteComponent {
  //Variables asincronas
  procedimientoId = input<number>();
  documentoId = input<number>();
  documentoEnviado = output<void>();
  cambioEstadoActividades = output<boolean[]>();
  form: FormGroup;
  formDocumentoBase!: FormGroup;

  //Variables con signals
  //Signals para manejar datos
  datosDocumentoBase = signal<any[]>([]);
  ultimoRegistro = signal<any>({});
  editarformulario = signal<any | null>(null);
  mensajedeDiagrama: boolean = false;
  nombreProcedimiento = signal('');

  //Input y edición de documentos base
  nuevoDato = signal('');
  documentoEditando = signal<any | null>(null);

  //Signals para controlar las vistas de las actividades
  mostrarFormularioDAAC = signal(true);
  mostrarDocumentoBase = signal(false);
  mostrarDiagramaFlujo = signal(false);

  //Servicios e inyeccion de dependencias
  private formularioDAACService = inject(FormularioDAACService);
  private ReglamentoBaseService = inject(ReglamentoBaseService);
  private cdr = inject(ChangeDetectorRef);
  private alertService = inject(AlertService);
  public datosService = inject(DatosService);
  private documentoSoporteService = inject(DocumentoSoporteService);
  private fb = inject(FormBuilder);
  private tablaFormularioDAACService = inject(TablaFormularioDAACService);

  //Data para 
  dataFormularioDAAC = toSignal(this.tablaFormularioDAACService.FormularioDAAC$, { initialValue: [] });

  //Signals para manejar estados de actividades
  estadoDocumentoSoporte = signal({
    formulario: false,
    reglamentoBase: false,
    diagramaFlujo: false
  });

  //Signal para deshabilitar botones
  deshabilitarNotiene = computed(() => {
    return this.datosDocumentoBase().length > 0;
  });

  deshabilitarAgregar = computed(() => {
    return this.datosDocumentoBase().some(d => d.documento === 'No tiene Reglamento Base');
  });
  columnaDocumentoBase = [
    { key: 'documento', label: 'Documentos Base' }
  ];

  constructor() {
    this.form = this.fb.group({
      id_diagrama: [''],
      documento_completado: [false],
    });

    this.formDocumentoBase = this.fb.group({
      tieneReglamento: [null, Validators.required]
    });

    effect(() => {
      const currentDocumentoId = this.documentoId();
      if (currentDocumentoId) {
        this.cargarFormularioPorDocumento(currentDocumentoId);
        this.verificarActividadesDocumentoSoporte();
        this.cargarDocumentosBase();
      }
    });
  }

  ngOnInit() {
  }


  onSubmit() {

  }

  //Este metodo se encarga de cargar el formulario por documento
  cargarFormularioPorDocumento(documentoId: number) {
    this.formularioDAACService.obtenerPorDocumento(documentoId).subscribe({
      next: (form: any) => {

        // Extraer nombre del procedimiento si viene en la respuesta
        if (form && form.documentoSoporte && form.documentoSoporte.procedimiento) {
          this.nombreProcedimiento.set(form.documentoSoporte.procedimiento.procedimiento);
        } else if (form && form.procedimiento) {
          this.nombreProcedimiento.set(form.procedimiento.procedimiento);
        }

        // Normalizar respuesta a array
        const datos = Array.isArray(form) ? form : (form ? [form] : []);

        if (datos.length > 0) {
          this.tablaFormularioDAACService.setDatosFormularioDAAC(datos);
          this.mostrarFormularioDAAC.set(false);
          this.mostrarDocumentoBase.set(true);
        } else {
          // no hay formulario: mostrar formulario para crear
          this.tablaFormularioDAACService.setDatosFormularioDAAC([]);
          this.mostrarFormularioDAAC.set(true);
          this.mostrarDocumentoBase.set(false);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.tablaFormularioDAACService.setDatosFormularioDAAC([]);
        this.mostrarFormularioDAAC.set(true);
        this.mostrarDocumentoBase.set(false);
        this.mostrarDiagramaFlujo.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  //Este metodo se encarga de guarduar el formulario DAAC
  guardarDatosFormularioDAAC(nuevoDato: any) {
    if (this.editarformulario()) {
      // editar caso existente (id incluido)
      const id = this.editarformulario().id;
      this.formularioDAACService.editarFormulario(id, nuevoDato).subscribe({
        next: () => {
          this.alertService.exito('Formulario actualizado correctamente');
          this.cargarFormularioPorDocumento(this.documentoId()!);
          this.actualizarLista();
          // Verificar actividades después de actualizar formulario
          this.verificarActividadesDocumentoSoporte();
          console.log(this.actualizarLista)
        },
        error: () => this.alertService.error('Error al actualizar el formulario')
      });
      this.editarformulario.set(null);
    } else {
      // creación: requiere documentoId
      if (!this.documentoId()) {
        this.alertService.error('El Documento de Soporte debe ser creado');
        return;
      }
      this.formularioDAACService.crearFormularioConDocumento(this.documentoId()!, nuevoDato).subscribe({
        next: () => {
          this.alertService.exito('Formulario guardado correctamente');
          this.cargarFormularioPorDocumento(this.documentoId()!);
          // Verificar actividades después de crear formulario
          this.verificarActividadesDocumentoSoporte();
        },
        error: (err) => {
          console.error('Error al guardar formulario', err);
          this.alertService.error('Error al guardar el formulario');
        }
      });
    }
    this.mostrarFormularioDAAC.set(false);
    this.mostrarDiagramaFlujo.set(false);
    this.mostrarDocumentoBase.set(false);
  }

  //Eliminar datos formulario DAAC
  eliminarDatoFormularioDAAC(item: any) {
    this.alertService.alertEliminar().then((res) => {
      if (res.isConfirmed) {
        this.formularioDAACService.eliminarFormularioDAAC(item.id).subscribe({
          next: () => {
            // Actualizar el servicio de tabla para que el signal se actualice automáticamente
            const actuales = this.dataFormularioDAAC();
            const actualizados = actuales.filter(p => p.id !== item.id);
            this.tablaFormularioDAACService.setDatosFormularioDAAC(actualizados);

            // Si no quedan datos, cambiar a la vista del formulario
            if (actualizados.length === 0) {
              this.mostrarFormularioDAAC.set(true);
              this.mostrarDocumentoBase.set(false);
              this.mostrarDiagramaFlujo.set(false);
            }
            this.alertService.exito('Formulario eliminado correctamente');
            this.verificarActividadesDocumentoSoporte();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error(err);
            this.alertService.error('No se pudo eliminar el formulario');
          },
        });
      }
    });
  }

  // Editar el formulario DAAC
  editarFormulario(dato: any) {
    this.editarformulario.set(dato);
    this.mostrarFormularioDAAC.set(true);
    this.mostrarDocumentoBase.set(false);
    this.mostrarDiagramaFlujo.set(false);
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    this.cargarDocumentosBase();
  }

  //Cargar documentos base
  cargarDocumentosBase() {
    if (!this.documentoId()) {
      this.alertService.infoInformacion('No hay documentoId, no se pueden cargar documentos base');
      return;
    }
    this.ReglamentoBaseService.obtenerReglamentoBasePorDocumento(this.documentoId()!).subscribe({
      next: (data) => {
        // Normalizar respuesta (puede ser un objeto o array)
        const datosArray = Array.isArray(data) ? data : (data ? [data] : []);
        const normalizados = datosArray.map(d => ({
          id: d.id,
          documento: d.documento ?? d.Documento ?? false   //<- null si no hay documento
        }));
        this.datosDocumentoBase.set(normalizados);
        if (normalizados.length > 0) {
          this.mostrarDiagramaFlujo.set(true);
        }
      },
      error: () => {
        this.datosDocumentoBase.set([]);
      }
    });
  }

  // Agregar o editar documento base
  agregarReglamentoBase() {
    const reglamentoBase = this.nuevoDato().trim();
    if (!reglamentoBase) {
      this.alertService.infoInformacion('Debe agregar un valor para el registro');
      return;
    }
    const nuevoReglamentoBase = { documento: reglamentoBase };
    // Si está editando
    if (this.documentoEditando()) {
      const id = this.documentoEditando().id;
      this.ReglamentoBaseService.ActualizarReglamentoBase(id, nuevoReglamentoBase).subscribe({
        next: () => {
          this.alertService.infoExito('Documento Base actualizado correctamente');
          this.cargarDocumentosBase();// Cargar por id relacionado con documento de soporte 
          this.documentoEditando.set(null);
          this.nuevoDato.set('');
          // Verificar actividades después de actualizar documento base
          setTimeout(() => this.verificarActividadesDocumentoSoporte(), 100);
        },
        error: () => this.alertService.error('Error al actualizar documento')
      });
    } else {
      // Si es nuevo
      this.ReglamentoBaseService.crearReglamentoBasePorDocumento(this.documentoId()!, nuevoReglamentoBase).subscribe({
        next: () => {
          this.alertService.infoExito('Documento Base agregado correctamente');
          this.cargarDocumentosBase();// Cargar por id relacionado con documento de soporte 
          this.nuevoDato.set('');
          // Verificar actividades después de agregar documento base
          setTimeout(() => this.verificarActividadesDocumentoSoporte(), 300);
        },
        error: () => {
          this.alertService.error('Error al agregar documento');
        }
      });
    }
    this.mostrarDiagramaFlujo.set(true);
    this.cdr.detectChanges();
  }


  NotieneReglamentoBase() {
    if (this.datosDocumentoBase().length > 0) {
      this.alertService.infoInformacion('Ya existe un documento base');
      return;
    }
    else {
      const payload = {
        documento: 'No tiene Reglamento Base'
      }
      this.ReglamentoBaseService
        .crearReglamentoBasePorDocumento(this.documentoId()!, payload)
        .subscribe({
          next: () => {
            this.alertService.infoExito('Documento Base agregado correctamente');
            this.cargarDocumentosBase();
            this.verificarActividadesDocumentoSoporte();
          },
          error: () => {
            this.alertService.error('Error al agregar documento');
          }
        });
    }
  }

  // Eliminar documento base
  eliminarDato(item: any) {
    this.ReglamentoBaseService.EliminarReglamentoBase(item.id).subscribe({
      next: () => {
        this.alertService.infoEliminar('Documento Base eliminado correctamente');
        this.cargarDocumentosBase();
        this.verificarActividadesDocumentoSoporte();
      },
      error: () => this.alertService.error('Error al eliminar documento')
    });
  }

  // Editar documento base (precarga en el input)
  editarDato(item: any) {
    this.nuevoDato.set(item.documento);
    this.documentoEditando.set(item);
  }

  cerrarFormularioDAAC() {
    this.mostrarFormularioDAAC.set(false);
    this.editarformulario.set(null);
    this.mostrarDocumentoBase.set(true);
    // Recargar datos y estados para asegurar que se muestre lo que existe
    if (this.documentoId()) {
      this.cargarFormularioPorDocumento(this.documentoId()!);
      this.verificarActividadesDocumentoSoporte();
    }
  }

  // Verificar y marcar actividades del documento de soporte
  verificarActividadesDocumentoSoporte() {
    if (!this.documentoId()) return;
    forkJoin({
      formularios: this.formularioDAACService.obtenerPorDocumento(this.documentoId()!).pipe(
        map(res => (Array.isArray(res) ? res : (res ? [res] : [])).length > 0)
      ),
      reglamentos: this.ReglamentoBaseService.obtenerReglamentoBasePorDocumento(this.documentoId()!).pipe(
        map(res => (Array.isArray(res) ? res : (res ? [res] : [])).length > 0)
      ),
      documento: this.documentoSoporteService.getPorProcedimiento(this.procedimientoId()!).pipe(
        map(doc => {
          if (doc && doc.procedimiento) {
            this.nombreProcedimiento.set(doc.procedimiento.procedimiento);
          }
          return {
            diagrama: !!doc?.id_diagrama,
            actividadesBackend: doc?.actividades_completadas
          };
        })
      )
    }).subscribe({
      next: ({ formularios, reglamentos, documento }) => {
        const nuevoEstado = {
          formulario: formularios,
          reglamentoBase: reglamentos,
          diagramaFlujo: documento.diagrama
        };
        // Mantener visibilidad del diagrama
        const tieneDocsBase = reglamentos;
        const tieneFormulario = formularios;
        this.mostrarDiagramaFlujo.set(documento.diagrama || (tieneFormulario && tieneDocsBase));

        // Actualizar señal de estado
        this.estadoDocumentoSoporte.set(nuevoEstado);

        // Emitir a padre para actualizar inmediatamente el color local
        this.cambioEstadoActividades.emit(Object.values(nuevoEstado));

        // Sincronizar con backend (una sola vez)
        this.actualizarActividadesDocumentoSoporte(nuevoEstado);
      }
    });
  }

  // Actualizar actividades en el backend (una sola llamada)
  private actualizarActividadesDocumentoSoporte(estado: any) {
    const todasCompletas = estado.formulario && estado.reglamentoBase && estado.diagramaFlujo;

    this.documentoSoporteService.actualizarDocumento(this.documentoId()!, {
      actividades_completadas: estado,
      documento_completado: todasCompletas
    }).subscribe({
      next: () => {
        if (todasCompletas) {
          this.documentoEnviado.emit();
        }
        this.cdr.detectChanges();
      }
    });
  }

  descargarPDF() {
    const doc = new jsPDF();
    doc.setFontSize(12);
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

  cancelarDiagrama() {
    this.mostrarDiagramaFlujo.set(false);

  }

  actualizarLista() {
    this.formularioDAACService.getFormularioDAAC().subscribe({
      next: (data) => {
        this.tablaFormularioDAACService.setDatosFormularioDAAC(data);
        this.cdr.detectChanges();
      },
      error: () => this.alertService.error('Error al recargar datos')
    });
  }

}

