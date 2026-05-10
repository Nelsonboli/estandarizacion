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

  private fb = inject(FormBuilder);
  private recoleccionService = inject(RecoleccionInformacionService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  ngOnInit() {
    this.iniciarFormulario();
  }

  private iniciarFormulario() {
    this.formularioRecoleccion = this.fb.group({
      encuesta: ['', Validators.required]
    });
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
  }

  Cancelar() {
    this.Cerrar();
    this.router.navigate(['/identificacionrequerimientos']);
  }


  Guardar() {
    if (this.formularioRecoleccion.invalid) return;

    const values = this.formularioRecoleccion.value;

    this.recoleccionService.crear(this.procedimientoId()).subscribe({
      next: (res) => {
        this.recoleccionService.actualizar(res.id!, values).subscribe({
          next: () => {
            this.alertService.exito('Información de recolección guardada');
            this.guardarExitoso.emit();
            this.Cerrar();
          },
          error: () => this.alertService.error('Error al actualizar la información')
        });
      },
      error: () => this.alertService.error('Error al procesar la recolección de información')
    });
  }
}
