import { DatosService } from '../../../../../shared/services/datos.service';
import { FormularioDAACService } from '../../../services/formulario-daac.service';
import { Component, signal, ChangeDetectorRef, effect, computed, input, output, inject, OnInit } from '@angular/core';
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
import { ReglamentoBase, FormularioDAAC, ActividadesDocumentoSoporte } from '../../../interfaces/documento-soporte.interface';
import { DiagramaDeFlujoComponent } from '../../diagrama-de-flujo/diagrama-de-flujo';

@Component({
  standalone: true,
  selector: 'app-documentacion-soporte',
  imports: [FormreutilizableComponent, CommonModule, FormsModule, ReactiveFormsModule, TablasFormularioComponent, TablaDatosComponent, DiagramaDeFlujoComponent],
  templateUrl: './documentacion-soporte.component.html',
  styleUrl: './documentacion-soporte.component.css'
})
export class DocumentacionSoporteComponent implements OnInit {
  // Inputs y Outputs
  procedimientoId = input<number>();
  documentoId = input<number>();
  documentoEnviado = output<void>();
  cambioEstadoActividades = output<boolean[]>();

  // Reactividad del formulario
  formReglamentoBase!: FormGroup;

  // Signals para manejar datos con tipado fuerte
  datosReglamentoBase = signal<ReglamentoBase[]>([]);
  ultimoRegistro = signal<FormularioDAAC | null>(null);
  editarformulario = signal<FormularioDAAC | null>(null);
  nombreProcedimiento = signal('');

  // Input y edición de documentos base
  nuevoDato = signal('');
  documentoEditando = signal<ReglamentoBase | null>(null);

  // Signals para controlar las vistas de las actividades
  mostrarReglamentoBase = signal(true);
  mostrarFormularioDAAC = signal(false);
  mostrarDiagramaFlujo = computed(() => this.reglamentoBaseCompletado() && this.formularioDAACCompletado());

  // Inyección de dependencias (Private por convención de buenas prácticas)
  private formularioDAACService = inject(FormularioDAACService);
  private reglamentoBaseService = inject(ReglamentoBaseService);
  private cdr = inject(ChangeDetectorRef);
  private alertService = inject(AlertService);
  public datosService = inject(DatosService);
  private documentoSoporteService = inject(DocumentoSoporteService);
  private fb = inject(FormBuilder);
  private tablaFormularioDAACService = inject(TablaFormularioDAACService);

  // Datos compartidos mediante servicio de tabla
  dataFormularioDAAC = toSignal(this.tablaFormularioDAACService.FormularioDAAC$, { initialValue: [] });

  // Signal para estado de actividades
  estadoDocumentoSoporte = signal<ActividadesDocumentoSoporte>({
    reglamentoBase: false,
    formulario: false,
    diagramaFlujo: false
  });

  // Signals computados para UI
  reglamentoBaseCompletado = computed(() => this.datosReglamentoBase().length > 0);
  formularioDAACCompletado = computed(() => this.dataFormularioDAAC().length > 0);
  deshabilitarNotiene = computed(() => this.reglamentoBaseCompletado());
  deshabilitarAgregar = computed(() => this.datosReglamentoBase().some(d => d.documento === 'No tiene Reglamento Base'));

  constructor() {
    this.formReglamentoBase = this.fb.group({
      tieneReglamento: [null, Validators.required]
    });

    // Efecto para reaccionar a cambios en documentoId
    effect(() => {
      const currentId = this.documentoId();
      if (currentId) {
        this.cargarDocumentosBase();
        this.verificarActividadesDocumentoSoporte();
        this.cargarFormularioPorDocumento(currentId);
      }
    });
  }

  ngOnInit(): void {
    // Inicialización si es requerida
  }
  // Cargar documentos base (Reglamentos)
  cargarDocumentosBase() {
    const docId = this.documentoId();
    if (!docId) return;
    this.reglamentoBaseService.obtenerReglamentoBasePorDocumento(docId).subscribe({
      next: (data: ReglamentoBase[]) => {
        const normalizados: ReglamentoBase[] = data.map(d => ({
          id: d.id,
          documento: d.documento ?? false
        }));
        this.datosReglamentoBase.set(normalizados);
      },
      error: () => this.datosReglamentoBase.set([])
    });
  }

  // Agregar o actualizar Reglamento Base
  agregarReglamentoBase() {
    const documento = this.nuevoDato().trim();
    const docId = this.documentoId();
    if (!documento) {
      this.alertService.infoInformacion('Debe llenar el campo con información del reglamento base');
      return;
    }
    if (!docId) return;
    const payload = { documento };
    const obs$ = this.documentoEditando()
      ? this.reglamentoBaseService.ActualizarReglamentoBase(this.documentoEditando()!.id!, payload)
      : this.reglamentoBaseService.crearReglamentoBasePorDocumento(docId, payload);

    obs$.subscribe({
      next: () => {
        const msg = this.documentoEditando() ? 'Reglamento base actualizado' : 'Reglamento base agregado';
        this.alertService.infoExito(msg);
        this.cargarDocumentosBase();
        this.documentoEditando.set(null);
        this.nuevoDato.set('');
        setTimeout(() => this.verificarActividadesDocumentoSoporte(), 200);
      },
      error: () => this.alertService.error('Error al procesar el documento')
    });
  }

  NotieneReglamentoBase() {
    if (this.deshabilitarNotiene()) return;
    const docId = this.documentoId();
    if (!docId) return;

    this.reglamentoBaseService.crearReglamentoBasePorDocumento(docId, { documento: 'No tiene Reglamento Base' }).subscribe({
      next: () => {
        this.alertService.infoExito('Reglamento base agregado correctamente');
        this.cargarDocumentosBase();
        this.verificarActividadesDocumentoSoporte();
      },
      error: () => this.alertService.error('Error al agregar el registro')
    });
  }

  eliminarDato(item: ReglamentoBase) {
    this.reglamentoBaseService.EliminarReglamentoBase(item.id!).subscribe({
      next: () => {
        this.alertService.infoEliminar('Reglamento base eliminado');
        this.cargarDocumentosBase();
        this.verificarActividadesDocumentoSoporte();
      },
      error: () => this.alertService.error('Error al eliminar')
    });
  }

  editarDato(item: ReglamentoBase) {
    this.nuevoDato.set(item.documento as string);
    this.documentoEditando.set(item);
  }
  // Cargar formulario DAAC relacionado al documento
  cargarFormularioPorDocumento(documentoId: number) {
    this.formularioDAACService.obtenerPorDocumento(documentoId).subscribe({
      next: (form: FormularioDAAC) => {
        if (form && !Array.isArray(form)) {
          this.ultimoRegistro.set(form);
          this.tablaFormularioDAACService.setDatosFormularioDAAC([form]);
          this.mostrarFormularioDAAC.set(false);
        } else {
          this.tablaFormularioDAACService.setDatosFormularioDAAC([]);
          this.mostrarFormularioDAAC.set(true);
          this.ultimoRegistro.set(null);
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.log("error al cargar el formulario", error);
        this.tablaFormularioDAACService.setDatosFormularioDAAC([]);
        this.mostrarFormularioDAAC.set(true);
        this.cdr.markForCheck();
      }
    });
  }

  // Guardar datos del formulario DAAC
  guardarDatosFormularioDAAC(nuevoDato: FormularioDAAC) {
    const docId = this.documentoId();
    if (!docId) {
      this.alertService.error('El Documento de Soporte debe ser creado');
      return;
    }

    // Limpiar el payload para el backend: el id se envía en el URL, no en el body.
    // Además aseguramos que documento_soporte_id esté presente.
    const { id, documentoSoporte, procedimiento, ...datosLimpios } = nuevoDato;
    const payload = { ...datosLimpios, documento_soporte_id: docId };

    const obs$ = this.editarformulario()
      ? this.formularioDAACService.editarFormulario(id!, payload)
      : this.formularioDAACService.crearFormularioConDocumento(docId, nuevoDato);

    obs$.subscribe({
      next: () => {
        const msg = this.editarformulario() ? 'Formulario actualizado correctamente' : 'Formulario guardado correctamente';
        this.alertService.exito(msg);
        this.cargarFormularioPorDocumento(docId);
        if (this.editarformulario()) this.actualizarLista();
        this.verificarActividadesDocumentoSoporte();
        this.editarformulario.set(null);
      },
      error: (err) => {
        console.error('Error al guardar formulario', err);
        this.alertService.error('Error al guardar el formulario');
      }
    });
    this.mostrarFormularioDAAC.set(false);
  }

  eliminarDatoFormularioDAAC(item: FormularioDAAC) {
    this.alertService.alertEliminar().then((res) => {
      if (res.isConfirmed) {
        this.formularioDAACService.eliminarFormularioDAAC(item.id!).subscribe({
          next: () => {
            const actuales = this.dataFormularioDAAC();
            const actualizados = actuales.filter((p: any) => p.id !== item.id);
            this.tablaFormularioDAACService.setDatosFormularioDAAC(actualizados);

            if (actualizados.length === 0) {
              this.mostrarFormularioDAAC.set(true);
              this.ultimoRegistro.set(null);
            }
            this.alertService.exito('Formulario eliminado correctamente');
            this.verificarActividadesDocumentoSoporte();
          },
          error: (err) => {
            console.error(err);
            this.alertService.error('No se pudo eliminar el formulario');
          }
        });
      }
    });
  }

  editarFormulario(dato: FormularioDAAC) {
    this.editarformulario.set(dato);
    this.mostrarFormularioDAAC.set(true);
  }

  cerrarFormularioDAAC() {
    this.mostrarFormularioDAAC.set(false);
    this.editarformulario.set(null);
    if (this.documentoId()) this.cargarFormularioPorDocumento(this.documentoId()!);
  }

  // Verificación integral de actividades del documento de soporte
  verificarActividadesDocumentoSoporte() {
    const docId = this.documentoId();
    const procId = this.procedimientoId();
    if (!docId || !procId) return;
    forkJoin({
      formularios: this.formularioDAACService.obtenerPorDocumento(docId).pipe(
        map(res => !!res)
      ),
      reglamentos: this.reglamentoBaseService.obtenerReglamentoBasePorDocumento(docId).pipe(
        map(res => res && res.length > 0)
      ),
      documento: this.documentoSoporteService.getPorProcedimiento(procId).pipe(
        map(doc => {
          if (doc?.procedimiento) this.nombreProcedimiento.set(doc.procedimiento.procedimiento);
          return { diagrama: !!doc?.diagramaFlujo };
        })
      )
    }).subscribe({
      next: ({ reglamentos, formularios, documento }) => {
        const nuevoEstado: ActividadesDocumentoSoporte = {
          reglamentoBase: reglamentos,
          formulario: formularios,
          diagramaFlujo: documento.diagrama
        };
        this.estadoDocumentoSoporte.set(nuevoEstado);
        this.cambioEstadoActividades.emit([nuevoEstado.reglamentoBase, nuevoEstado.formulario, nuevoEstado.diagramaFlujo]);
        this.actualizarActividadesDocumentoSoporte(nuevoEstado);
      }
    });
  }

  private actualizarActividadesDocumentoSoporte(estado: ActividadesDocumentoSoporte) {
    const todasCompletas = estado.reglamentoBase && estado.formulario && estado.diagramaFlujo;
    this.documentoSoporteService.actualizarDocumento(this.documentoId()!, {
      actividades_completadas: estado,
      documento_completado: todasCompletas
    }).subscribe({
      next: () => {
        if (todasCompletas) this.documentoEnviado.emit();
      }
    });
  }

  descargarPDF() {
    const registro = this.ultimoRegistro();
    if (!registro) {
      this.alertService.error('No hay datos para generar el PDF');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(this.datosService.DescripcionCaracterizacion[0], 10, 10);

    const campos = Object.keys(registro).filter(k => k !== 'id' && k !== 'documento_soporte_id' && k !== 'documentoSoporte');
    const filas = campos.map(campo => [
      campo.charAt(0).toUpperCase() + campo.slice(1),
      Array.isArray((registro as any)[campo]) ? (registro as any)[campo].join(', ') : (registro as any)[campo]
    ]);

    autoTable(doc, {
      head: [['Campo', 'Valor']],
      body: filas,
      startY: 20,
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 20;
    if (this.datosReglamentoBase().length > 0) {
      const filasDocs = this.datosReglamentoBase().map(d => [d.documento]);
      autoTable(doc, {
        head: [['Documento base']],
        body: filasDocs,
        startY: finalY + 10,
      });
    }
    doc.save("FormatoDAAC.pdf");
  }

  cancelarDiagrama() {
    // this.mostrarDiagramaFlujo.set(false); // No longer needed as it's computed
  }

  actualizarLista() {
    this.formularioDAACService.getFormularioDAAC().subscribe({
      next: (data) => {
        this.tablaFormularioDAACService.setDatosFormularioDAAC(data);
        this.cdr.markForCheck();
      }
    });
  }
}

