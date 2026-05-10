import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SoporteComputacionalService } from '../../../services/soporte-computacional.service';
import { AlertService } from '../../../../../shared/services/alert.service';
import { SoporteComputacional } from '../../../interfaces/soporte-computacional.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TablaDatosComponent } from '../../../../../shared/components/tabla-datos/tabla-datos.component';
import { Campos } from '../../../../../shared/interfaces/campos.interface';


@Component({
  standalone: true,
  selector: 'app-soporte-computacional',
  imports: [ReactiveFormsModule, CommonModule, TablaDatosComponent,],
  templateUrl: './soporte-computacional.component.html',
  styleUrl: './soporte-computacional.component.css'
})
export class SoporteComputacionalComponent implements OnInit {
  procedimientoId = input<number>();
  soporteId = input<number>();
  soporteEnviado = output<void>();
  cambioEstadoActividades = output<boolean[]>();
  form!: FormGroup;
  modoEdicion = false;

  // Signal para manejar estado de actividades
  estadoSoporteComputacional = signal({
    formularioCompleto: false
  });

  mostrarTabla = signal(false);
  datosTabla = signal<any[]>([]);

  columnasSoporte: Campos[] = [
    { key: 'tiene_soporte_texto', label: '¿Cuenta con soporte?' },
    { key: 'nombre_texto', label: 'Nombre del soporte' },
    { key: 'descripcion_texto', label: 'Descripción' },
    { key: 'requiere_soporte_texto', label: '¿Requiere soporte?' }
  ];

  //Servicios e Inyeccion de dependencias
  private soporteComputacionalService = inject(SoporteComputacionalService);
  private alertService = inject(AlertService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const currentSoporteId = this.soporteId();
      if (currentSoporteId) {
        // Verificar actividades cuando cambie el soporteId
        this.verificarActividadesSoporteComputacional();
      }
    });
  }

  ngOnInit() {
    this.iniciarFormulario();
    this.cargarDatosExistentes();
  }

  private iniciarFormulario() {
    this.form = this.fb.group({
      tiene_soporte: [null, Validators.required],
      nombre: [{ value: '', disabled: true }],
      descripcion: [{ value: '', disabled: true }],
      requiere_soporte: [null]
    });

    // Control reactivo de campos según tiene_soporte
    this.form.get('tiene_soporte')?.valueChanges.subscribe(value => {
      if (value === null || value === undefined || value === '') {
        ['nombre', 'descripcion', 'requiere_soporte'].forEach(key => {
          const ctrl = this.form.get(key);
          ctrl?.disable();
          ctrl?.clearValidators();
          ctrl?.reset();
          ctrl?.updateValueAndValidity();
        });
        return;
      }

      const tieneSoporte = value === true || value === 'true';
      const controls = {
        nombre: this.form.get('nombre'),
        descripcion: this.form.get('descripcion'),
        requiere: this.form.get('requiere_soporte')
      };

      if (tieneSoporte) {
        controls.nombre?.enable();
        controls.nombre?.setValidators([Validators.required]);
        controls.descripcion?.enable();
        controls.descripcion?.setValidators([Validators.required]);
        controls.requiere?.disable();
        controls.requiere?.reset();
        controls.requiere?.clearValidators();
      } else {
        ['nombre', 'descripcion'].forEach(key => {
          const ctrl = this.form.get(key);
          ctrl?.disable();
          ctrl?.clearValidators();
          ctrl?.reset();
        });
        controls.requiere?.enable();
        controls.requiere?.setValidators([Validators.required]);
      }
      Object.values(controls).forEach(ctrl => ctrl?.updateValueAndValidity());
    });
  }

  cargarDatosExistentes() {
    const id = this.procedimientoId();
    if (!id) return;
    this.soporteComputacionalService.getSoporteComputacional(id)
      .subscribe({
        next: (data) => {
          if (data) {
            this.modoEdicion = true;
            this.form.patchValue({
              tiene_soporte: data.tiene_soporte,
              nombre: data.nombre,
              descripcion: data.descripcion,
              requiere_soporte: data.requiere_soporte
            });

            if (data.computacional_completado) {
              this.prepararDatosTabla(data);
              this.mostrarTabla.set(true);
            }
          } else {
            this.crearSoporteNuevo();
          }
        },
        error: () => {
          this.alertService.error('Error al cargar datos existentes');
        }
      });
  }

  crearSoporteNuevo() {
    const id = this.procedimientoId();
    if (!id) return;
    this.soporteComputacionalService.crearSoporteComputacional(id)
      .subscribe({
        next: () => {
          this.modoEdicion = false;
          this.alertService.infoExito('Soporte computacional creado correctamente');
        },
        error: () => {
          this.alertService.error('No se pudo crear el registro de soporte computacional');
        }
      });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.alertService.error('Por favor completa todos los campos requeridos');
      this.form.markAllAsTouched();
      return;
    }
    const currentSoporteId = this.soporteId();
    if (!currentSoporteId) {
      this.alertService.error('Error: No se ha identificado el registro de soporte');
      return;
    }
    const formValues = this.form.getRawValue();
    const formData: Partial<SoporteComputacional> = {
      tiene_soporte: formValues.tiene_soporte === true || formValues.tiene_soporte === 'true',
      nombre: formValues.nombre || null,
      descripcion: formValues.descripcion || null,
      requiere_soporte: formValues.requiere_soporte === true || formValues.requiere_soporte === 'true'
    };
    this.soporteComputacionalService.actualizarSoporteComputacional(currentSoporteId, formData)
      .subscribe({
        next: () => {
          this.alertService.infoExito('Soporte computacional actualizado correctamente');
          this.prepararDatosTabla({
            id: currentSoporteId,
            tiene_soporte: formData.tiene_soporte ?? null,
            nombre: formData.nombre ?? null,
            descripcion: formData.descripcion ?? null,
            requiere_soporte: formData.requiere_soporte ?? null,
            computacional_completado: true
          });
          this.mostrarTabla.set(true);

          // Emitir inmediatamente para actualizar la UI del padre
          const completado = (formData.tiene_soporte === true)
            ? !!(formData.nombre && formData.descripcion)
            : (formData.tiene_soporte === false && formData.requiere_soporte !== null);

          if (completado) {
            this.cambioEstadoActividades.emit([true]);
            this.actualizarActividadesSoporteComputacional();
          }
        },
        error: (err) => {
          console.error('Error al actualizar soporte:', err);
          this.alertService.error('Error al guardar el soporte computacional');
        }
      });
  }

  private verificarFormulario(soporte: SoporteComputacional) {
    const completado = (soporte.tiene_soporte === true)
      ? !!(soporte.nombre && soporte.descripcion)
      : (soporte.tiene_soporte === false && soporte.requiere_soporte !== null);
    const estadoActual = this.estadoSoporteComputacional().formularioCompleto;
    if (estadoActual === completado) {
      this.cambioEstadoActividades.emit([completado]);
      return;
    }
    this.estadoSoporteComputacional.update(state => ({
      ...state,
      formularioCompleto: completado
    }));
    this.actualizarActividadesSoporteComputacional();
    this.cambioEstadoActividades.emit([completado]);
  }

  verificarActividadesSoporteComputacional() {
    const procId = this.procedimientoId();
    const soporteId = this.soporteId();
    if (!procId || !soporteId) return;
    this.soporteComputacionalService.getSoporteComputacional(procId)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (soporte) => {
          if (!soporte) return;
          this.verificarFormulario(soporte);
        },
        error: (err) => {
          this.alertService.error(
            'Error al verificar actividades:',
            err
          );
          this.estadoSoporteComputacional.set({
            formularioCompleto: false
          });
          this.cambioEstadoActividades.emit([false]);
        }
      });
  }

  actualizarActividadesSoporteComputacional() {
    const soporteId = this.soporteId();
    if (!soporteId) return;
    const esCompleto = this.estadoSoporteComputacional().formularioCompleto;
    this.soporteComputacionalService.actualizarSoporteComputacional(soporteId, {
      computacional_completado: esCompleto
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        if (esCompleto) {
          this.soporteEnviado.emit();
        }
      },
      error: (err) => {
        console.error(
          'Error al actualizar estado:',
          err
        );
      }
    });
  }

  prepararDatosTabla(soporte: SoporteComputacional) {
    const row = {
      ...soporte, // Incluir todos los datos originales para la edición
      tiene_soporte_texto: soporte.tiene_soporte ? 'Sí' : 'No',
      nombre_texto: soporte.tiene_soporte ? (soporte.nombre || 'Vacío') : 'Vacío',
      descripcion_texto: soporte.tiene_soporte ? (soporte.descripcion || 'Vacío') : 'Vacío',
      requiere_soporte_texto: !soporte.tiene_soporte ? (soporte.requiere_soporte !== null ? (soporte.requiere_soporte ? 'Sí' : 'No') : 'No especificado') : 'No aplica'
    };
    this.datosTabla.set([row]);
  }

  editarSoporte(soporte: SoporteComputacional) {
    this.form.patchValue({
      tiene_soporte: soporte.tiene_soporte,
      nombre: soporte.nombre,
      descripcion: soporte.descripcion,
      requiere_soporte: soporte.requiere_soporte
    });
    this.mostrarTabla.set(false);
  }

  eliminarSoporte(soporte: SoporteComputacional) {
    const id = this.soporteId();
    if (!id) return;

    this.alertService.confirmar('¿Estás seguro de eliminar el registro de soporte computacional?', 'Esta acción restablecerá los datos.')
      .then((result) => {
        if (result.isConfirmed) {
          const resetData: Partial<SoporteComputacional> = {
            tiene_soporte: null,
            nombre: null,
            descripcion: null,
            requiere_soporte: null,
            computacional_completado: false
          };

          this.soporteComputacionalService.actualizarSoporteComputacional(id, resetData)
            .subscribe({
              next: () => {
                this.alertService.infoExito('Registro eliminado correctamente');
                this.form.reset();
                this.mostrarTabla.set(false);
                this.verificarActividadesSoporteComputacional();
              },
              error: () => {
                this.alertService.error('Error al eliminar el registro');
              }
            });
        }
      });
  }

  regresarAlFormulario() {
    this.mostrarTabla.set(false);
  }
}

