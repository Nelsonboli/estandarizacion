import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, effect, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SoporteComputacionalService } from '../../../services/soporte-computacional.service';
import { AlertService } from '../../../../../shared/services/alert.service';


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

  constructor(
    private fb: FormBuilder,
    private soporteComputacionalService: SoporteComputacionalService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      const currentSoporteId = this.soporteId();
      if (currentSoporteId) {
        // Verificar actividades cuando cambie el soporteId
        this.verificarActividadesSoporteComputacional();
      }
    });
  }

  ngOnInit() {
    this.form = this.fb.group({
      tiene_soporte: ['', Validators.required],
      nombre: [{ value: '', disabled: true }],
      descripcion: [{ value: '', disabled: true }],
      requiere_soporte: ['']
    });

    // Control de tiene_soporte
    this.form.get('tiene_soporte')?.valueChanges.subscribe(value => {
      if (value === true || value === 'true') {
        this.form.get('nombre')?.enable();
        this.form.get('nombre')?.setValidators([Validators.required]);
        this.form.get('descripcion')?.enable();
        this.form.get('descripcion')?.setValidators([Validators.required]);
        this.form.get('requiere_soporte')?.reset();
        this.form.get('requiere_soporte')?.clearValidators();
      } else if (value === false || value === 'false') {
        this.form.get('nombre')?.disable();
        this.form.get('nombre')?.clearValidators();
        this.form.get('nombre')?.reset();
        this.form.get('descripcion')?.disable();
        this.form.get('descripcion')?.clearValidators();
        this.form.get('descripcion')?.reset();
        this.form.get('requiere_soporte')?.setValidators([Validators.required]);
      }
      this.form.get('nombre')?.updateValueAndValidity();
      this.form.get('descripcion')?.updateValueAndValidity();
      this.form.get('requiere_soporte')?.updateValueAndValidity();
    });
    this.cargarDatosExistentes();
  }

  cargarDatosExistentes() {
    this.soporteComputacionalService.getSoporteComputacional(this.procedimientoId()!)
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
        }
      });
  }

  crearSoporteNuevo() {
    this.soporteComputacionalService.crearSoporteComputacional(this.procedimientoId()!)
      .subscribe({
        next: (data) => {
          this.modoEdicion = false;
          this.alertService.infoExito('Soporte computacional creado correctamente');
        },
        error: (err) => {
        }
      });
  }

  onSubmit() {
    if (!this.form.valid) {
      this.alertService.error('Por favor completa todos los campos');
      return;
    }

    if (!this.soporteId()) {
      this.alertService.error('Error: No se ha creado el registro de soporte');
      return;
    }

    const formData = {
      tiene_soporte: this.form.get('tiene_soporte')?.value === true || this.form.get('tiene_soporte')?.value === 'true',
      nombre: this.form.get('nombre')?.value || null,
      descripcion: this.form.get('descripcion')?.value || null,
      requiere_soporte: this.form.get('requiere_soporte')?.value === true || this.form.get('requiere_soporte')?.value === 'true'
    };

    this.soporteComputacionalService.actualizarSoporteComputacional(this.soporteId()!, formData)
      .subscribe({
        next: () => {
          this.alertService.infoExito('Soporte computacional actualizado correctamente');
          // Verificar actividades después de guardar
          setTimeout(() => this.verificarActividadesSoporteComputacional(), 300);
        },
        error: (err) => {
          this.alertService.error('Error al guardar el soporte computacional');
        }
      });
  }

  private verificarFormulario(soporte: any) {
    // El formulario está completo si tiene todos los campos requeridos
    let completado = false;
    if (soporte.tiene_soporte === true) {
      // Si tiene soporte, debe tener nombre y descripción
      completado = !!(soporte.nombre && soporte.descripcion);
    } else if (soporte.tiene_soporte === false) {
      // Si no tiene soporte, debe tener requiere_soporte
      completado = soporte.requiere_soporte !== null && soporte.requiere_soporte !== undefined;
    }
    const estadoActual = this.estadoSoporteComputacional();
    if (estadoActual.formularioCompleto !== completado) {
      this.estadoSoporteComputacional.update(state => ({ ...state, formularioCompleto: completado }));
      this.actualizarActividadesSoporteComputacional();
    }
    this.cambioEstadoActividades.emit([completado]);
  }

  // Verificar y marcar actividades del soporte computacional
  verificarActividadesSoporteComputacional() {
    if (!this.soporteId()) {
      return;
    }
    // Cargar el estado guardado en el backend
    this.soporteComputacionalService.getSoporteComputacional(this.procedimientoId()!).subscribe({
      next: (soporte) => {
        this.verificarFormulario(soporte);
      },
      error: () => {
        this.estadoSoporteComputacional.set({ formularioCompleto: false });
        this.cambioEstadoActividades.emit([false]);
      }
    });
  }

  // Actualizar actividades en el backend (optimizado - una sola llamada HTTP)
  private actualizarActividadesSoporteComputacional() {
    const estado = this.estadoSoporteComputacional();
    const SoporteComputacional = estado.formularioCompleto;
    this.soporteComputacionalService.actualizarSoporteComputacional(this.soporteId()!, {
      computacional_completado: SoporteComputacional
    }).subscribe({
      next: () => {
        if (SoporteComputacional) {
          this.soporteEnviado.emit();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
      }
    });
  }

}

