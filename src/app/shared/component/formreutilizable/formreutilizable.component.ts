import { Component, EventEmitter, Input, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TablaprocedimientoComponent } from '../tablaprocedimiento/tablaprocedimiento.component';
import { AlertService } from '../../servicios/alert.service';
import { MatIconModule } from '@angular/material/icon';



@Component({
  selector: 'app-formreutilizable',
  imports: [ReactiveFormsModule, FormsModule, TablaprocedimientoComponent, MatIconModule],
  templateUrl: './formreutilizable.component.html',
  styleUrl: './formreutilizable.component.css'
})
export class FormreutilizableComponent implements OnInit {
  // Inputs y outputs
  @Input() titulo: string[]| undefined;
  @Input() campos: { key: string; label: string; Tooltip?: string; required?: boolean }[] = [];
  @Input() datoEditar: any = null;
  @Output() guardar = new EventEmitter<any>();
  @Output() cerrar = new EventEmitter<void>();
  showTooltip: string | null = null;

  form!: FormGroup;
  listaDatos = signal<any[]>([]);
  editIndex = signal<number | null>(null);

  constructor(private fb: FormBuilder, private alertService: AlertService) { }

  ngOnInit(): void {
    const group: any = {};
    for (const campo of this.campos) {
      group[campo.key] = ['', Validators.required];
    }
    this.form = this.fb.group(group);

    if (this.datoEditar) {
      this.cargarFormulario(this.datoEditar);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datoEditar'] && this.datoEditar) {
      this.cargarFormulario(this.datoEditar);
    }
  }

  // Campos que aceptan múltiples valores
  camposMultiples = ['Roles', 'Actividades', 'Referentes'];
  camposMultiplesDAAC = ['Proveedores', 'Insumos', 'Resultados', 'Requisitos legales', 'Documentos', 'Registros'];
  todosMultiples = [...this.camposMultiples, ...this.camposMultiplesDAAC];

  cargarDatoEditar(dato: any) {
    if (!this.form) return; // 🚨 evita error si no existe el form
    const campoKey = Object.keys(dato)[0];
    const valor = dato[campoKey];
    if (this.form.get(campoKey)) {
      this.form.get(campoKey)?.setValue(valor);
    }
    const index = this.listaDatos().findIndex(d => d[campoKey] === valor);
    this.editIndex.set(index >= 0 ? index : null);
  }

  // Cargar el formulario completo en edición
  cargarFormulario(dato: any) {
    // reconstruir las tablas internas
    const lista: any[] = [];
    this.campos.forEach(campo => {
      if (this.todosMultiples.includes(campo.key)) {
        // Si es múltiple → cada valor es un registro
        (dato[campo.key] || []).forEach((valor: any) =>
          lista.push({ [campo.key]: valor }),
        );
      } else {
        // Si es simple → un solo valor
        if (dato[campo.key]) {
          lista.push({ [campo.key]: dato[campo.key] });
        }
      }
    });
    this.listaDatos.set(lista);
  }

  /**
   * Agregar un valor a la tabla correspondiente
   */
  agregarCampo(campo: string) {
    const control = this.form.get(campo);
    if (control && control.valid) {
      const nuevoRegistro = { [campo]: control.value };

      if (this.editIndex() !== null) {
        // 🔄 Reemplazar en la posición editada
        this.listaDatos.update(lista => {
          const copia = [...lista];
          copia[this.editIndex()!] = nuevoRegistro;
          return copia;
        });
        this.editIndex.set(null);
      } else {
        // Si el campo no es múltiple, validar duplicado
        if (!this.todosMultiples.includes(campo)) {
          const yaExiste = this.listaDatos().some(d => d[campo] !== undefined);
          if (yaExiste) {
            this.alertService.error(`Solo se permite agregar un ${campo}.`);
            control.reset();
            return;
          }
        }
        // ➕ Agregar normalmente
        this.listaDatos.update(lista => [...lista, nuevoRegistro]);
      }

      control.reset();
    } else {
      control?.markAsTouched();
    }
  }

  /**
   * Retorna solo los datos filtrados de cada campo
   */
  listaDatosFiltradas(campo: string) {
    return this.listaDatos().filter(d => d[campo] !== undefined);
  }

  /**
   * Eliminar un dato de la tabla
   */
  eliminarDato(item: any) {
    this.listaDatos.update(lista => lista.filter(p => p !== item));
  }

  /**
   * Cancelar formulario
   */
  cancelarFormulario() {
    this.alertService.alertCancelar().then((res) => {
      if (res.isConfirmed) {
        this.cerrar.emit();
        this.form.reset();
        this.listaDatos.set([]); // ✅
      }
    });
  }
  /**
   * Enviar el formulario con todos los datos
   */
  enviarFormulario() {
    if (this.listaDatos().length > 0) {
      const registro: any = {};
      this.campos.forEach(campo => {
        const datosCampo = this.listaDatos()
          .filter(d => d[campo.key] !== undefined)
          .map(d => d[campo.key]);

        if (this.todosMultiples.includes(campo.key)) {
          registro[campo.key] = datosCampo;
        } else {
          registro[campo.key] = datosCampo.length > 0 ? datosCampo[0] : '';
        }
      });
      this.alertService.alertGuardar().then((res) => {
        if (res.isConfirmed) {
          this.alertService.exito('Formulario guardado exitosamente');
          this.guardar.emit(registro);
          this.listaDatos.set([]);
          this.form.reset();
        }
      });

    } else {
      this.form.markAllAsTouched();
    }
  }
}
