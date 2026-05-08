import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SoporteComputacionalService } from '../../../services/soporte-computacional.service';
import { AlertService } from '../../../../../shared/services/alert.service';
import { SoporteComputacional } from '../../../interfaces/soporte-computacional.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
  standalone: true,
  selector: 'app-soporte-computacional',
  imports: [ReactiveFormsModule, CommonModule],
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
          this.verificarActividadesSoporteComputacional();
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
}

