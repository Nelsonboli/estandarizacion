import { DatosService } from '../../../shared/servicios/datos.service';
import { Diagrama } from '../../../paginas/diagrama/diagrama/diagrama';
import { FormularioDAACService } from './../../../shared/servicios/modulos/formulario-daac.service';
import { Component, signal, ChangeDetectorRef, Input, Output, EventEmitter, OnChanges, SimpleChanges, effect } from '@angular/core';
import { FormreutilizableComponent } from '../../../shared/component/formreutilizable/formreutilizable.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AlertService } from '../../../shared/Utils/Alertas/alert.service';
import { TablasFormularioComponent } from "../../../shared/component/tablas-formulario/tablas-formulario.component";
import { TablaDatosComponent } from "../../../shared/component/tabla-datos/tabla-datos.component";
import { ReglamentoBaseService } from '../../../shared/servicios/modulos/reglamento-base.service';
import { EstandarizacionService } from '../../../shared/servicios/estandarizacion.service';
import { DocumentoSoporteService } from '../../../shared/servicios/modulos/documento-soporte.service';


@Component({
  standalone: true,
  selector: 'app-documentacion-soporte',
  imports: [FormreutilizableComponent, CommonModule, FormsModule, ReactiveFormsModule, TablasFormularioComponent, TablaDatosComponent, Diagrama],
  templateUrl: './documentacion-soporte.component.html',
  styleUrl: './documentacion-soporte.component.css'
})
export class DocumentacionSoporteComponent implements OnChanges {
  //Variables asincronas
  @Input() procedimientoId!: number;
  @Input() documentoId!: number;
  @Output() documentoEnviado = new EventEmitter<void>();
  @Output() cambioEstadoActividades = new EventEmitter<boolean[]>();
  form: FormGroup;
  formDocumentoBase!: FormGroup;

  //Variables con signals
  datosDAAC = signal<any[]>([]);
  datosDocumentoBase = signal<any[]>([]);
  ultimoRegistro = signal<any>({});
  editarformulario = signal<any | null>(null);
  mensajedeDiagrama: boolean = false;
  nombreProcedimiento = signal('');

  //Input y edición de documentos base
  nuevoDato = signal('');
  documentoEditando = signal<any | null>(null);
  datosFiltrados: any[] = [];

  //Signals para controlar UI
  mostrarFormulario = signal(true);
  mostrarbase = signal(false);
  realizarDiagrama = signal(false);
  mostrarDiagrama = signal(false);
  descargarDocumento = signal(false)

  //Signals para manejar estados de actividades
  estadoDocumentoSoporte = signal({
    formulario: false,
    reglamentoBase: false,
    diagramaFlujo: false
  });

  constructor(
    private formularioDAACService: FormularioDAACService,
    private ReglamentoBaseService: ReglamentoBaseService,
    private cdr: ChangeDetectorRef,
    private alertService: AlertService,
    public datosService: DatosService,
    private fb: FormBuilder,
    private estandarizacionService: EstandarizacionService,
    private documentoSoporteService: DocumentoSoporteService,
  ) {
    this.form = this.fb.group({
      id_diagrama: [''],
      documento_completado: [false],
    });

    this.formDocumentoBase = this.fb.group({
      tieneReglamento: [null, Validators.required]
    });

    // Escuchar cambios en el radio button
    this.formDocumentoBase.get('tieneReglamento')?.valueChanges.subscribe(val => {
      if (val === 'no') {
        this.guardarDecisionReglamento(false);
      }
    });
  }

  columnaDocumentoBase = [
    { key: 'documento', label: 'Documentos Base' }
  ];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentoId'] && this.documentoId) {
      this.cargarFormularioPorDocumento(this.documentoId);
      // Verificar actividades cuando cambie el documentoId
      this.verificarActividadesDocumentoSoporte()
    }
  }

  ngOnInit() {
    this.cargarDocumentosBase();
    console.log('el documento es:', this.documentoId);

    if (this.documentoId) {
      this.cargarFormularioPorDocumento(this.documentoId);
      this.verificarActividadesDocumentoSoporte();
    } else {
      console.log('⚠️ No hay documentoId disponible aún');
    }
  }

  onSubmit() {

  }

  //Este metodo se encarga de cargar el formulario por documento
  cargarFormularioPorDocumento(documentoId: number) {
    console.log('🔍 Cargando formulario para documentoId:', documentoId);
    this.formularioDAACService.obtenerPorDocumento(documentoId).subscribe({
      next: (form: any) => {
        console.log('📦 Respuesta del backend:', form);

        // Extraer nombre del procedimiento si viene en la respuesta
        if (form && form.documentoSoporte && form.documentoSoporte.procedimiento) {
          this.nombreProcedimiento.set(form.documentoSoporte.procedimiento.procedimiento);
        } else if (form && form.procedimiento) {
          this.nombreProcedimiento.set(form.procedimiento.procedimiento);
        }

        // Normalizar respuesta a array
        const datos = Array.isArray(form) ? form : (form ? [form] : []);
        console.log('📊 Datos normalizados:', datos);
        console.log('📏 Longitud de datos:', datos.length);

        if (datos.length > 0) {
          this.datosFiltrados = datos;
          this.mostrarFormulario.set(false);
          this.mostrarbase.set(true);
          console.log('✅ Mostrando tabla con datos');
        } else {
          // no hay formulario: mostrar formulario para crear
          this.datosFiltrados = [];
          this.mostrarFormulario.set(true);
          this.mostrarbase.set(false);
          console.log('📝 Mostrando formulario de creación');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error cargando formulario:', err);
        this.datosFiltrados = [];
        this.mostrarFormulario.set(true);
        this.mostrarbase.set(false);
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
          this.cargarFormularioPorDocumento(this.documentoId!);
          this.actualizarLista();
          // Verificar actividades después de actualizar formulario
          setTimeout(() => this.verificarActividadesDocumentoSoporte(), 300);
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
          // Verificar actividades después de crear formulario
          setTimeout(() => this.verificarActividadesDocumentoSoporte(), 300);
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


  //Eliminar datos formulario DAAC
  eliminarDatoFormularioDAAC(item: any) {
    this.alertService.alertEliminar().then((res) => {
      if (res.isConfirmed) {
        this.formularioDAACService.eliminarFormularioDAAC(item.id).subscribe({
          next: () => {
            // Actualizar los datos filtrados (los que se muestran en la tabla)
            this.datosFiltrados = this.datosFiltrados.filter(p => p.id !== item.id);
            // Si no quedan datos, cambiar a la vista del formulario
            if (this.datosFiltrados.length === 0) {
              this.mostrarFormulario.set(true);
              this.mostrarbase.set(false);
            }
            this.alertService.exito('Formulario eliminado correctamente');
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
    this.mostrarFormulario.set(true);
    this.mostrarbase.set(false);
    this.mostrarDiagrama.set(false);
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    this.cargarDocumentosBase();
  }

  //Cargar documentos base
  cargarDocumentosBase() {
    if (!this.documentoId) {
      console.log('⚠️ No hay documentoId, no se pueden cargar documentos base');
      return;
    }
    this.ReglamentoBaseService.obtenerReglamentoBasePorDocumento(this.documentoId).subscribe({
      next: (data) => {
        // Normalizar respuesta (puede ser un objeto o array)
        const datosArray = Array.isArray(data) ? data : (data ? [data] : []);
        const normalizados = datosArray.map(d => ({
          id: d.id,
          documento: d.documento ?? d.Documento ?? null   //<- null si no hay documento
        }));
        this.datosDocumentoBase.set(normalizados);

        // Determinar estado del radio button basado en datos
        if (normalizados.length > 0) {
          const tieneDocumentoReal = normalizados.some(d => d.documento !== null && d.documento !== '');
          if (tieneDocumentoReal) {
            this.formDocumentoBase.patchValue({ tieneReglamento: 'si' }, { emitEvent: false });
          } else {
            // Si hay registro pero documento es null, es un "No"
            this.formDocumentoBase.patchValue({ tieneReglamento: 'no' }, { emitEvent: false });
          }
        } else {
          this.formDocumentoBase.patchValue({ tieneReglamento: null }, { emitEvent: false });
        }

        console.log('📄 Documentos Base cargados para documento', this.documentoId, ':', normalizados);
        if (normalizados.length > 0) {
          this.realizarDiagrama.set(true);
        }
      },
      error: () => {
        this.datosDocumentoBase.set([]);
        console.log('⚠️ No hay documentos base para este documento de soporte');
      }
    });
  }

  // Guardar decisión de NO tiene reglamento (crea o actualiza registro con documento null/vacío)
  guardarDecisionReglamento(tiene: boolean) {
    if (tiene) return; // Si es 'si', no hace nada automático, espera a que el usuario agregue documentos

    const existentes = this.datosDocumentoBase();
    if (existentes.length > 0) {

      // Si ya existe un registro "null", no hacemos nada.
      const yaExisteNull = existentes.some(d => d.documento === null || d.documento === '');
      if (yaExisteNull && existentes.length === 1) return;

    }

    const nuevoReglamentoBase = { documento: null }; // Enviar null
    this.ReglamentoBaseService.crearReglamentoBasePorDocumento(this.documentoId, nuevoReglamentoBase).subscribe({
      next: () => {
        // this.alertService.exito('Reglamento base marcado como NO');
        this.cargarDocumentosBase();
        setTimeout(() => this.verificarActividadesDocumentoSoporte(), 300);
      },
      error: (e) => console.error(e)
    });
  }

  // Agregar o editar documento base
  agregarReglamentoBase() {
    const reglamentoBase = this.nuevoDato().trim();
    if (!reglamentoBase) return;

    const nuevoReglamentoBase = { documento: reglamentoBase };

    // Si está editando
    if (this.documentoEditando()) {
      const id = this.documentoEditando().id;
      console.log("el id es:", id);
      this.ReglamentoBaseService.ActualizarReglamentoBase(id, nuevoReglamentoBase).subscribe({
        next: () => {
          this.alertService.infoExito('Documento Base actualizado correctamente');
          this.cargarDocumentosBase();// Cargar por id relacionado con documento de soporte 
          this.documentoEditando.set(null);
          this.nuevoDato.set('');
          // Verificar actividades después de actualizar documento base
          setTimeout(() => this.verificarActividadesDocumentoSoporte(), 300);
        },
        error: () => this.alertService.error('Error al actualizar documento')
      });
    } else {
      // Si es nuevo
      this.ReglamentoBaseService.crearReglamentoBasePorDocumento(this.documentoId, nuevoReglamentoBase).subscribe({
        next: () => {
          this.alertService.infoExito('Documento Base agregado correctamente');
          this.cargarDocumentosBase();// Cargar por id relacionado con documento de soporte 
          this.nuevoDato.set('');
          // Verificar actividades después de agregar documento base
          setTimeout(() => this.verificarActividadesDocumentoSoporte(), 300);
        },
        error: () => {
          console.error('Error al guardar formulario');
          this.alertService.error('Error al agregar documento');
        }
      });
    }
    this.realizarDiagrama.set(true);
  }

  // Eliminar documento base
  eliminarDato(item: any) {
    this.ReglamentoBaseService.EliminarReglamentoBase(item.id).subscribe({
      next: () => {
        this.alertService.infoEliminar('Documento Base eliminado correctamente');
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

  guardar() {
    this.estandarizacionService.guardarDocumentoSoporte(this.procedimientoId, this.form.value)
      .subscribe({
        next: () => {
          this.documentoEnviado.emit();
        },
        error: (err) => console.error('Error al guardar documento soporte', err)
      });
  }

  onCancelar() {
    this.mostrarFormulario.set(false);
    this.editarformulario.set(null);
    this.mostrarbase.set(true);
  }

  // Verificar y marcar actividades del documento de soporte
  verificarActividadesDocumentoSoporte() {
    if (!this.documentoId) {
      console.log('⚠️ No hay documentoId, no se pueden verificar actividades');
      return;
    }
    // Primero cargar el estado guardado en el backend
    this.documentoSoporteService.getPorProcedimiento(this.procedimientoId).subscribe({
      next: (documento) => {
        // Si existe actividades_completadas en el backend, usarlas como base
        if (documento.actividades_completadas) {
          this.estadoDocumentoSoporte.set({
            formulario: documento.actividades_completadas.formulario,
            reglamentoBase: documento.actividades_completadas.reglamentoBase,
            diagramaFlujo: documento.actividades_completadas.diagramaFlujo,
          });
          console.log('📥 Estados cargados desde backend:', documento.actividades_completadas);
        }

        // Ahora verificar el estado actual de cada actividad
        this.verificarFormulario();
        this.verificarReglamentoBase();
        this.verificarDiagrama();
      },
      error: () => {
        console.log('⚠️ No se pudo cargar el documento');
        // Continuar con la verificación normal
        this.verificarFormulario();
        this.verificarReglamentoBase();
        this.verificarDiagrama();
      }
    });
  }

  private verificarFormulario() {
    this.formularioDAACService.obtenerPorDocumento(this.documentoId).subscribe({
      next: (formularios) => {
        const datos = Array.isArray(formularios) ? formularios : (formularios ? [formularios] : []);
        const completado = datos.length > 0;

        // Solo actualizar si el estado cambió
        const estadoActual = this.estadoDocumentoSoporte();
        if (estadoActual.formulario !== completado) {
          this.estadoDocumentoSoporte.update(state => ({ ...state, formulario: completado }));
          console.log('📋 Formulario DAAC:', completado ? 'Completado' : 'Pendiente');
          this.actualizarActividadesDocumentoSoporte();
        }
        this.cambioEstadoActividades.emit(Object.values(this.estadoDocumentoSoporte()));
      },
      error: () => {
        const estadoActual = this.estadoDocumentoSoporte();
        if (estadoActual.formulario !== false) {
          this.estadoDocumentoSoporte.update(state => ({ ...state, formulario: false }));
          this.actualizarActividadesDocumentoSoporte();
        }
        this.cambioEstadoActividades.emit(Object.values(this.estadoDocumentoSoporte()));
      }
    });
  }

  private verificarReglamentoBase() {
    this.ReglamentoBaseService.obtenerReglamentoBasePorDocumento(this.documentoId).subscribe({
      next: (reglamento) => {
        const datos = Array.isArray(reglamento) ? reglamento : (reglamento ? [reglamento] : []);
        const completado = datos.length > 0;

        const estadoActual = this.estadoDocumentoSoporte();
        if (estadoActual.reglamentoBase !== completado) {
          this.estadoDocumentoSoporte.update(state => ({ ...state, reglamentoBase: completado }));
          console.log('📄 Documentos base:', completado ? 'Completado' : 'Pendiente');
          this.actualizarActividadesDocumentoSoporte();
        }
        this.cambioEstadoActividades.emit(Object.values(this.estadoDocumentoSoporte()));
      },
      error: () => {
        const estadoActual = this.estadoDocumentoSoporte();
        if (estadoActual.reglamentoBase !== false) {
          this.estadoDocumentoSoporte.update(state => ({ ...state, reglamentoBase: false }));
          this.actualizarActividadesDocumentoSoporte();
        }
        this.cambioEstadoActividades.emit(Object.values(this.estadoDocumentoSoporte()));
      }
    });
  }

  private verificarDiagrama() {
    this.documentoSoporteService.getPorProcedimiento(this.procedimientoId).subscribe({
      next: (documento) => {
        // Usar id_diagrama para verificar si existe
        const completado = !!documento?.id_diagrama;

        if (documento && documento.procedimiento) {
          this.nombreProcedimiento.set(documento.procedimiento.procedimiento);
          console.log(' Nombre del procedimiento extraído:', documento.procedimiento.procedimiento);
        }

        const estadoActual = this.estadoDocumentoSoporte();
        if (estadoActual.diagramaFlujo !== completado) {
          this.estadoDocumentoSoporte.update(state => ({ ...state, diagramaFlujo: completado }));
          console.log('Diagrama:', completado ? 'Completado' : 'Pendiente');
          this.actualizarActividadesDocumentoSoporte();
        }
        this.cambioEstadoActividades.emit(Object.values(this.estadoDocumentoSoporte()));
      },
      error: () => {
        const estadoActual = this.estadoDocumentoSoporte();
        if (estadoActual.diagramaFlujo !== false) {
          this.estadoDocumentoSoporte.update(state => ({ ...state, diagramaFlujo: false }));
          this.actualizarActividadesDocumentoSoporte();
        }
        this.cambioEstadoActividades.emit(Object.values(this.estadoDocumentoSoporte()));
      }
    });
  }

  // Actualizar actividades en el backend (optimizado - una sola llamada HTTP)
  private actualizarActividadesDocumentoSoporte() {
    const estado = this.estadoDocumentoSoporte();
    const todasCompletas = estado.formulario && estado.reglamentoBase && estado.diagramaFlujo;
    // Actualizar actividades_completadas Y documento_completado en UNA sola llamada
    this.documentoSoporteService.actualizarDocumento(this.documentoId, {
      actividades_completadas: {
        formulario: estado.formulario,
        reglamentoBase: estado.reglamentoBase,
        diagramaFlujo: estado.diagramaFlujo,
      },
      documento_completado: todasCompletas
    }).subscribe({
      next: () => {
        console.log('✅ Actividades guardadas en backend:', estado);
        if (todasCompletas) this.documentoEnviado.emit();

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al guardar actividades:', err);
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

  abrirDiagrama() {
    this.realizarDiagrama.set(false);
    this.mostrarDiagrama.set(true);
    // No activar descargarDocumento aquí - se activará cuando el usuario guarde el diagrama
  }

  cancelarDiagrama() {
    this.mostrarDiagrama.set(false);
    this.realizarDiagrama.set(true);
    this.descargarDocumento.set(false);
  }

  recibirvalor(valor: boolean) {
    if (valor) {
      this.descargarDocumento.set(true);
      // Verificar actividades después de guardar diagrama
      setTimeout(() => this.verificarActividadesDocumentoSoporte(), 300);
      this.documentoEnviado.emit();
    }
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
