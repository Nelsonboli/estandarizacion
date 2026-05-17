import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, input, OnInit, output, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RecoleccionInformacionService } from '../../../modules/estandarizacion/services/recoleccion-informacion.service';
import { AlertService } from '../../services/alert.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-modal-recoleccion-informacion',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './modal-recoleccion-informacion.component.html',
  styleUrl: './modal-recoleccion-informacion.component.css'
})
export class ModalRecoleccionInformacionComponent implements OnInit {
  visible = input(false);
  procedimientoId = input<number>(0);

  cerrar = output<void>();
  guardarExitoso = output<void>();

  @ViewChild('formulario') formularioRef!: ElementRef;

  escalar = signal(false);
  formularioRecoleccion!: FormGroup;
  private recoleccionId: number | null = null;

  private fb = inject(FormBuilder);
  private recoleccionService = inject(RecoleccionInformacionService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  ngOnInit() {
    this.iniciarFormulario();
    this.cargarDatosExistentes();
  }

  private iniciarFormulario() {
    this.formularioRecoleccion = this.fb.group({
      encuesta: ['', Validators.required]
    });
  }

  private cargarDatosExistentes() {
    if (this.procedimientoId() > 0) {
      this.recoleccionService.getPorProcedimiento(this.procedimientoId()).subscribe({
        next: (data) => {
          if (data && data.encuesta && data.encuesta.trim() !== '') {
            this.recoleccionId = data.id || null;
            this.formularioRecoleccion.patchValue({
              encuesta: data.encuesta
            });
          }
        },
        error: (err) => console.error('Error al cargar datos existentes:', err)
      });
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.formularioRef && !this.formularioRef.nativeElement.contains(event.target)) {
      this.escalar.set(true);
      setTimeout(() => this.escalar.set(false), 300);
    }
  }

  Cerrar() {
    this.cerrar.emit();
    this.formularioRecoleccion.reset();
    this.recoleccionId = null;
  }

  Cancelar() {
    if (this.recoleccionId) {
      this.Cerrar();
    } else {
      this.Cerrar();
      this.router.navigate(['/identificacionrequerimientos']);
    }
  }


  Guardar() {
    if (this.formularioRecoleccion.invalid) return;

    const values = this.formularioRecoleccion.value;

    if (this.recoleccionId) {
      // Actualizar registro existente
      this.recoleccionService.actualizar(this.recoleccionId, values).subscribe({
        next: () => {
          this.alertService.exito('Información de recolección actualizada correctamente');
          this.guardarExitoso.emit();
          this.Cerrar();
        },
        error: () => this.alertService.error('Error al actualizar la información')
      });
    } else {
      // Crear registro nuevo
      this.recoleccionService.crear(this.procedimientoId()).subscribe({
        next: (res) => {
          this.recoleccionService.actualizar(res.id!, values).subscribe({
            next: () => {
              this.alertService.exito('Información de recolección guardada');
              this.guardarExitoso.emit();
              this.Cerrar();
            },
            error: () => this.alertService.error('Error al completar el guardado')
          });
        },
        error: () => this.alertService.error('Error al crear la recolección de información')
      });
    }
  }
}
