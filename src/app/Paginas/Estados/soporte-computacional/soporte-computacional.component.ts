import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SoporteComputacionalService } from '../../../shared/servicios/modulos/soporte-computacional.service';
import { AlertService } from '../../../shared/Utils/Alertas/alert.service';

@Component({
  selector: 'app-soporte-computacional',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './soporte-computacional.component.html',
  styleUrl: './soporte-computacional.component.css'
})
export class SoporteComputacionalComponent implements OnInit, OnChanges {
  @Input() procedimientoId!: number;
  @Input() soporteId!: number;
  @Output() soporteEnviado = new EventEmitter<void>();
  @Output() cambioEstadoActividades = new EventEmitter<boolean[]>();

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
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['soporteId'] && this.soporteId) {
      // Verificar actividades cuando cambie el soporteId
      this.verificarActividadesSoporteComputacional();
    }
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
    this.soporteComputacionalService.getSoporteComputacional(this.procedimientoId)
      .subscribe({
        next: (data) => {
          if (data) {
            this.soporteId = data.id;
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
          // No existe, crear uno nuevo
          console.error('Error al cargar soporte computacional');
        }
      });
  }

  crearSoporteNuevo() {
    this.soporteComputacionalService.crearSoporteComputacional(this.procedimientoId)
      .subscribe({
        next: (data) => {
          this.soporteId = data.id;
          this.modoEdicion = false;
          this.alertService.alertExitoArriba('Soporte computacional creado correctamente');
        },
        error: (err) => {
          console.error('Error al crear soporte computacional:', err);
        }
      });
  }

  onSubmit() {
    if (!this.form.valid) {
      this.alertService.error('Por favor completa todos los campos');
      return;
    }

    if (!this.soporteId) {
      this.alertService.error('Error: No se ha creado el registro de soporte');
      return;
    }

    const formData = {
      tiene_soporte: this.form.get('tiene_soporte')?.value === true || this.form.get('tiene_soporte')?.value === 'true',
      nombre: this.form.get('nombre')?.value || null,
      descripcion: this.form.get('descripcion')?.value || null,
      requiere_soporte: this.form.get('requiere_soporte')?.value === true || this.form.get('requiere_soporte')?.value === 'true'
    };

    this.soporteComputacionalService.actualizarSoporteComputacional(this.soporteId, formData)
      .subscribe({
        next: () => {
          this.alertService.alertExitoArriba('Soporte computacional actualizado correctamente');
          // Verificar actividades después de guardar
          setTimeout(() => this.verificarActividadesSoporteComputacional(), 300);
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          this.alertService.error('Error al guardar el soporte computacional');
        }
      });
  }

  // Verificar y marcar actividades del soporte computacional
  verificarActividadesSoporteComputacional() {
    if (!this.soporteId) {
      console.log('⚠️ No hay soporteId, no se pueden verificar actividades');
      return;
    }
    // Cargar el estado guardado en el backend
    this.soporteComputacionalService.getSoporteComputacional(this.procedimientoId).subscribe({
      next: (soporte) => {
        // Verificar si el formulario está completo
        this.verificarFormulario(soporte);
      },
      error: () => {
        console.log('⚠️ No se pudo cargar el soporte computacional');
        this.estadoSoporteComputacional.set({ formularioCompleto: false });
        this.cambioEstadoActividades.emit([false]);
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
      console.log('� Formulario Soporte Computacional:', completado ? 'Completado' : 'Pendiente');
      this.actualizarActividadesSoporteComputacional();
    }
    this.cambioEstadoActividades.emit([completado]);
  }

  // Actualizar actividades en el backend (optimizado - una sola llamada HTTP)
  private actualizarActividadesSoporteComputacional() {
    const estado = this.estadoSoporteComputacional();
    const SoporteComputacional = estado.formularioCompleto;
    console.log('💾 Guardando actividades soporte computacional:', estado);
    console.log('🎯 Soporte Computacional:', SoporteComputacional);
    // Actualizar computacional_completado en el backend
    this.soporteComputacionalService.actualizarSoporteComputacional(this.soporteId, {
      computacional_completado: SoporteComputacional
    }).subscribe({
      next: () => {
        console.log('✅ Actividades guardadas en backend:', estado);
        if (SoporteComputacional) {
          console.log('✅ Soporte computacional marcado como completado');
          // Emitir evento al componente padre para cambiar el color del botón
          this.soporteEnviado.emit();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al guardar actividades:', err);
      }
    });
  }

}
