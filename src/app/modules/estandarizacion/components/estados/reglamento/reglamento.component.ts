import { Component, OnInit, inject, input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubirArchivoComponent } from '../../subir-archivo/subir-archivo.component';
import { FormatoEstandarizacionComponent } from '../../formato-estandarizacion/formato-estandarizacion.component';
import { ProcedimientoService } from '../../../../identificacion-requerimientos/services/procedimiento.service';

@Component({
  standalone: true,
  selector: 'app-reglamento',
  imports: [ReactiveFormsModule, SubirArchivoComponent, FormatoEstandarizacionComponent],
  templateUrl: './reglamento.component.html',
  styleUrl: './reglamento.component.css'
})
export class ReglamentoComponent implements OnInit {
  descargaActiva: 'descargarProcedimiento' | 'descargarEstandarizacion' | null = null;
  subidaActiva: 'subirProcedimiento' | 'subirEstandarizacion' | null = null;
  formatoEstandarizacion = "Formato de Estandarizacion"
  fichaProcedimiento = "Ficha de Procedimiento"
  procedimientoId = input<number>();
  form!: FormGroup;
  subiendo = false;

  //servicios e inyecciones de dependencias
  private procedimientoService = inject(ProcedimientoService);
  private fb = inject(FormBuilder);

  ngOnInit() {
    this.form = this.fb.group({
      respuesta1: ['', Validators.required],
      detalle1: [''],
    });

  }

  onSubmit() {
  }

  subirArchivoEstandarizacion(file: File) {
  }

  subirArchivoProcedimiento(file: File) {
  }

  DescargarReporteDAAC() {
    const pId = this.procedimientoId();
    if (pId) {
      this.procedimientoService.getProcedimiento(pId).subscribe({
        next: (data) => {
          const nombreProcedimiento = data.procedimiento || 'Procedimiento';
          const nombreArchivo = `Reporte_DAAC_${nombreProcedimiento.replace(/ /g, '_')}.pdf`;

          this.procedimientoService.descargarReporte(pId).subscribe({
            next: (blob: Blob) => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.style.display = 'none';
              a.href = url;
              a.download = nombreArchivo;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            },
            error: (error) => {
              console.error('Error al descargar el reporte DAAC:', error);
              alert('Error al descargar el reporte. Por favor intente nuevamente.');
            }
          });
        },
        error: (error) => {
          console.error('Error al obtener datos del procedimiento:', error);
          alert('Error al obtener datos del procedimiento.');
        }
      });
    } else {
      console.error('No hay ID de procedimiento seleccionado');
      alert('No se ha seleccionado un procedimiento para descargar el reporte.');
    }
  }
}


