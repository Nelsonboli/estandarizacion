import { Component, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DiagramaService } from '../../../shared/servicios/diagrama.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-reglamento',
  imports: [ReactiveFormsModule],
  templateUrl: './reglamento.component.html',
  styleUrl: './reglamento.component.css'
})
export class ReglamentoComponent implements OnInit {
  seccionActiva: 'descargar' | 'validar' | null = null;
  formatoEstandarizacion = "Formato de Estandarizacion"
  fichaProcedimiento = "Ficha de Procedimiento"
  @Input() procedimientoId!: number;
  form!: FormGroup;

  constructor(private fb: FormBuilder,
    private diagramaService: DiagramaService
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
    const imgData = this.diagramaService.cargarImagen();
    if (imgData) {
      doc.addImage(imgData, 'PNG', 10, 20, 180, 100); // posición y tamaño
    } else {
      doc.text('No se ha guardado ningún diagrama.', 10, 20);
    }

    // Guardar PDF
    doc.save('procedimiento.pdf');
  }

}
