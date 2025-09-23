import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
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
  @Input() titulo: string | undefined;
  @Input() campos: { key: string; label: string; Tooltip?: string; required?: boolean }[] = [];
  @Input() datoEditar: any = null;
  @Output() guardar = new EventEmitter<any>();
  @Output() cerrar = new EventEmitter<void>();
  showTooltip: string | null = null;

  form!: FormGroup;
  listaDatos: any[] = [];
  editIndex: number | null = null;

  constructor(private fb: FormBuilder, private alertService: AlertService) { }

  ngOnInit(): void {
    const group: any = {};
    for (const campo of this.campos) {
      group[campo.key] = ['', Validators.required];
    }
    this.form = this.fb.group(group);

    if (this.datoEditar) {
      this.cargarDatoEditar(this.datoEditar);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datoEditar'] && this.datoEditar) {
      this.cargarDatoEditar(this.datoEditar);
    }
  }

  // Campos que aceptan múltiples valores
  camposMultiples = ['Rol', 'Actividades', 'Referentes'];
  camposMultiplesDAAC = ['Proveedores', 'Insumos', 'Resultados', 'Requisitos legales', 'Documentos', 'Registros'];
  todosMultiples = [...this.camposMultiples, ...this.camposMultiplesDAAC];
  /**
   * Carga los valores del dato en edición en el formulario y las tablas
   */
  cargarDatoEditar(dato: any) {
    this.listaDatos = [];
    this.campos.forEach(campo => {
      const valor = dato[campo.key];
      if (valor !== undefined && valor !== null) {
        if (this.todosMultiples.includes(campo.key) && Array.isArray(valor)) {
          valor.forEach((v: any) => {
            this.listaDatos.push({ [campo.key]: v });
          });
        } else {
          this.listaDatos.push({ [campo.key]: valor });
        }
        this.form.get(campo.key)?.setValue(valor);
      }
    });
  }
  /**
   * Agregar un valor a la tabla correspondiente
   */
  agregarCampo(campo: string) {
    const control = this.form.get(campo);
    if (control && control.valid) {
      const nuevoRegistro = { [campo]: control.value };
      this.listaDatos.push(nuevoRegistro);
      control.reset();
    } else {
      control?.markAsTouched();
    }
  }

  /**
   * Retorna solo los datos filtrados de cada campo
   */
  listaDatosFiltradas(campo: string) {
    return this.listaDatos.filter(d => d[campo] !== undefined);
  }

  /**
   * Eliminar un dato de la tabla
   */
  eliminarDato(item: any) {
    this.listaDatos = this.listaDatos.filter(p => p !== item);
  }

  /**
   * Cancelar formulario
   */
  cancelarFormulario() {
    this.alertService.alertCancelar().then((res) => {
      if (res.isConfirmed) {
        this.cerrar.emit();
        this.form.reset();
        this.listaDatos = [];
      }
    });

  }
  /**
   * Enviar el formulario con todos los datos
   */
  enviarFormulario() {
    if (this.listaDatos.length > 0) {
      const registro: any = {};
      // Campos que aceptan múltiples valores
      this.campos.forEach(campo => {
        const datosCampo = this.listaDatos
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
          this.alertService.exito('Formulario guardado exitosamente')
          this.guardar.emit(registro);
          this.listaDatos = [];
          this.form.reset();
        }
      });


    } else {
      this.form.markAllAsTouched();
    }
  }
}
