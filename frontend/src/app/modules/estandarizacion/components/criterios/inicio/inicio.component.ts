import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { RecoleccionInformacionService } from '../../../services/recoleccion-informacion.service';
import { RecoleccionInformacion } from '../../../interfaces/recoleccion-informacion.interface';

import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../../shared/services/alert.service';

@Component({
  standalone: true,
  selector: 'app-inicio',
  imports: [CommonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {
  procedimientoId = input<number>(0);
  recoleccion = signal<RecoleccionInformacion | null>(null);

  solicitarEdicion = output<void>();

  private recoleccionInformacionService = inject(RecoleccionInformacionService);
  private alertService = inject(AlertService);

  ngOnInit(): void {
    this.obtenerRecoleccionInformacion();
  }

  obtenerRecoleccionInformacion() {
    if (this.procedimientoId() === 0) return;
    this.recoleccionInformacionService.getPorProcedimiento(this.procedimientoId()).subscribe({
      next: (data) => {
        if (data && data.encuesta && data.encuesta.trim() !== '') {
          this.recoleccion.set(data);
        } else {
          this.recoleccion.set(null);
        }
      },
      error: (error) => {
        console.error('Error al obtener recolección:', error);
        this.recoleccion.set(null);
      }
    });
  }

  eliminarRecoleccion() {
    const data = this.recoleccion();
    if (!data || !data.id) return;

    this.alertService.alertEliminar().then((result) => {
      if (result.isConfirmed) {
        this.recoleccionInformacionService.eliminar(data.id!).subscribe({
          next: () => {
            this.recoleccion.set(null);
            this.alertService.exito('Recolección de información eliminada');
            // Abrir el modal automáticamente para que el usuario no omita la recolección
            this.solicitarEdicion.emit();
          },
          error: () => {
            this.alertService.error('Error al eliminar la recolección de información');
          }
        });
      }
    });
  }

  editarRecoleccion() {
    this.solicitarEdicion.emit();
  }
}
