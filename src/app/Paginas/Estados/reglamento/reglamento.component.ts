import { Component, Input, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DiagramaFlujoService } from '../../../shared/servicios/modulos/diagrama-flujo.service';
import jsPDF from 'jspdf';
import { SubirArchivoComponent } from "../../../shared/component/subir-archivo/subir-archivo.component";
import { AlertService } from '../../../shared/Utils/Alertas/alert.service';

@Component({
  standalone: true,
  selector: 'app-reglamento',
  imports: [ReactiveFormsModule, SubirArchivoComponent],
  templateUrl: './reglamento.component.html',
  styleUrl: './reglamento.component.css'
})
export class ReglamentoComponent implements OnInit {
  descargaActiva: 'descargarProcedimiento' | 'descargarEstandarizacion' | null = null;
  subidaActiva: 'subirProcedimiento' | 'subirEstandarizacion' | null = null;
  formatoEstandarizacion = "Formato de Estandarizacion"
  fichaProcedimiento = "Ficha de Procedimiento"
  @Input() procedimientoId!: number;
  form!: FormGroup;
  subiendo = false;

  constructor(private fb: FormBuilder,
    private diagramaFlujoService: DiagramaFlujoService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      respuesta1: ['', Validators.required],
      detalle1: [''],
    });
  }

  onSubmit() {

  }

  descargarDocumento() {
    const doc = new jsPDF();

    // Agregar título
    doc.text('Ficha de Procedimiento', 10, 10);
    // Cargar diagrama
    const imgData = this.diagramaFlujoService.cargarImagen();
    if (imgData) {
      doc.addImage(imgData, 'PNG', 10, 20, 180, 100); // posición y tamaño
    } else {
      doc.text('No se ha guardado ningún diagrama.', 10, 20);
    }

    // Guardar PDF
    doc.save('procedimiento.pdf');
  }

  subirArchivoEstandarizacion(file: File) {

  }

  subirArchivoProcedimiento(file: File) {

  }

  //  subirArchivo(file: File) {
  //   this.subiendo = true;

  //   this.reglamentoService.subirArchivo(file).subscribe({
  //     next: () => {
  //       this.subiendo = false;
  //       this.alertService.alertExitoArriba('Archivo subido correctamente');
  //     },
  //     error: () => {
  //       this.subiendo = false;
  //       this.alertService.alertExitoArriba('Error subiendo el archivo');
  //     }
  //   });
  // }

}
