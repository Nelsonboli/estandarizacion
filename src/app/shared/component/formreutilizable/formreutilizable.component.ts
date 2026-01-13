import { Component, EventEmitter, Input, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../Utils/Alertas/alert.service';
import { MatIconModule } from '@angular/material/icon';
import { TablasFormularioComponent } from "../tablas-formulario/tablas-formulario.component";
import { TitleCasePipe, NgClass } from '@angular/common';




@Component({
  selector: 'app-formreutilizable',
  imports: [ReactiveFormsModule, FormsModule, MatIconModule, TablasFormularioComponent, TitleCasePipe, NgClass],
  templateUrl: './formreutilizable.component.html',
  styleUrl: './formreutilizable.component.css'
})
export class FormreutilizableComponent implements OnInit {
  // Inputs y outputs
  @Input() titulo: string[] | undefined;
  @Input() campos: {
    key: string;
    label: string;
    Tooltip?: string;
    required?: boolean;
    type?: 'input' | 'select' | 'textarea';
    options?: { label: string; value: any }[];
  }[] = [];
  @Input() datoEditar: any = null;
  @Output() guardar = new EventEmitter<any>();
  @Output() cerrar = new EventEmitter<void>();
  showTooltip: string | null = null;

  form!: FormGroup;
  listaDatos = signal<any[]>([]);
  editIndex = signal<number | null>(null);

  constructor(private fb: FormBuilder,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    const group: any = {};
    for (const campo of this.campos) {
      group[campo.key] = ['', Validators.required];
    }
    this.form = this.fb.group(group);

    setTimeout(() => {
      if (this.datoEditar) {
        this.cargarFormulario(this.datoEditar);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datoEditar'] && this.datoEditar && this.form) {
      this.cargarFormulario(this.datoEditar);
    }
  }

  cambiarColorSelect(event: Event) {
    const select = event.target as HTMLSelectElement;
    if (select.value) {
      select.classList.remove('text-gray-400');
      select.classList.add('text-black');
    }
  }

  // Campos que aceptan múltiples valores
  camposMultiples = ['roles', 'actividades', 'referencias'];
  camposMultiplesDAAC = ['responsable', 'proveedores', 'insumos', 'resultados', 'recibe', 'requisitos', 'documentos', 'registros'];
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
    const lista: any[] = [];
    this.campos.forEach(campo => {
      let valorCampo = dato[campo.key];

      // 🔒 Asegurar que los campos múltiples siempre sean arreglos
      if (this.todosMultiples.includes(campo.key)) {
        try {
          // Si es texto tipo JSON, convertirlo
          if (typeof valorCampo === 'string') {
            valorCampo = JSON.parse(valorCampo);
          }
        } catch {
          // Si no es JSON válido, lo envolvemos en array
          valorCampo = [valorCampo];
        }

        // Si no es array, lo convertimos
        if (!Array.isArray(valorCampo)) {
          valorCampo = [valorCampo];
        }

        // Ya podemos recorrer sin error
        valorCampo.forEach((valor: any) =>
          lista.push({ [campo.key]: valor }),
        );
      } else {
        // Campos simples
        if (valorCampo !== undefined && valorCampo !== null) {
          lista.push({ [campo.key]: valorCampo });
        }
      }
    });
    this.listaDatos.set(lista);
  }

  agregarCampo(campo: string) {
    const control = this.form.get(campo);
    if (control && control.valid) {
      const nuevoRegistro = { [campo]: control.value };

      if (this.editIndex() !== null) {
        // 🔄 Reemplazar en la posición editada
        this.listaDatos.update(lista => {
          const copia = [...lista];
          const valorAnterior = copia[this.editIndex()!][campo];
          const valorNuevo = control.value;

          // Si el valor ha cambiado, mostrar alerta de éxito
          if (valorAnterior !== valorNuevo) {
            this.alertService.infoExito('Campo actualizado');
          }

          copia[this.editIndex()!] = nuevoRegistro;
          return copia;
        });
        this.editIndex.set(null);
      } else {
        // Si el campo no es múltiple, validar duplicado
        if (!this.todosMultiples.includes(campo)) {
          const yaExiste = this.tieneDatosEnTabla(campo);
          if (yaExiste) {
            this.alertService.error(`Solo se permite agregar un valor para ${campo}.`);
            control.reset();
            control.markAsUntouched(); // evita que muestre error visual
            return;
          }
        }
        this.listaDatos.update(lista => [...lista, nuevoRegistro]);
      }
      control.reset();
    } else {
      control?.markAsTouched();
    }
  }

  //  Retorna solo los datos filtrados de cada campo
  listaDatosFiltradas(campo: string) {
    return this.listaDatos().filter(d => d[campo] !== undefined);
  }

  //  Eliminar un dato de la tabla
  eliminarDato(item: any) {
    this.listaDatos.update(lista => lista.filter(p => p !== item));
    this.alertService.infoEliminar('Campo eliminado');
  }

  // Cancelar formulario
  cancelarFormulario() {
    this.alertService.alertCancelar().then((res) => {
      if (res.isConfirmed) {
        this.cerrar.emit();
        this.form.reset();
        this.listaDatos.set([]);
      }
    });
  }

  enviarFormulario() {
    // Verificar qué campos no tienen datos en la tabla
    const camposFaltantes = this.campos
      .filter(campo => {
        const tieneDatos = this.tieneDatosEnTabla(campo.key)
        return !tieneDatos;
      });
    // Si hay campos faltantes...
    if (camposFaltantes.length > 0) {
      // Marcar solo los campos faltantes como "touched" 
      camposFaltantes.forEach(campo => {
        const control = this.form.get(campo.key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }

      });

      // Mostrar alerta con los campos faltantes
      const listaCampos = camposFaltantes.map(c => c.label).join(', ');
      this.alertService.advertencia(
        `Debe llenar los siguientes campos: ${listaCampos}`,
        'Formulario incompleto'
      );
      return;
    }

    // Si todos los campos tienen datos, crear el registro
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

    // Confirmar guardado
    this.alertService.alertGuardar().then((res) => {
      if (res.isConfirmed) {
        this.alertService.exito('Formulario guardado exitosamente');

        if (this.datoEditar?.id) {
          registro.id = this.datoEditar.id;
        }

        this.guardar.emit(registro);
        this.listaDatos.set([]);
        this.form.reset();
      }
    });
  }

  tieneDatosEnTabla(campoKey: string): boolean {
    return this.listaDatos().some(d => d[campoKey] !== undefined && d[campoKey] !== '');
  }

}
