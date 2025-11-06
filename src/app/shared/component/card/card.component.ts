import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-card',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() indice: number | null = null;
  @Input() refrescar!: boolean; 
  @Output() estadoCompleto = new EventEmitter<{ index: number; completo: boolean }>();

  form!: FormGroup;
  subopciones: string[] = [];


  // ["Actividades del procedimiento", "Roles del procedimiento", "Referencias"],
  opciones = [ 
    ["Formulario de procedimiento DAAC", "Reglamento base", "Diagrama de procedimiento"],
    ["Soporte computacional"],
    ["Procedimiento Enviado DAAC", "Procedimiento aprobado por la DAAC"]
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    if (typeof this.indice === 'number') {
      this.subopciones = this.opciones[this.indice];

      const procedimientoId = sessionStorage.getItem('procedimientoActivo');
      const guardados = JSON.parse(localStorage.getItem('estandarizaciones') || '{}');
      const prev = procedimientoId ? guardados?.[procedimientoId]?.[this.indice] || [] : [];

      this.form = this.fb.group({
        checks: this.fb.array(
          this.subopciones.map((_, i) => this.fb.control(prev[i] || false))
        )
      });

      this.listenToChanges();
      this.verificarEstadoCompleto();
    }
  }

  get checks(): FormArray {
    return this.form.get('checks') as FormArray;
  }

  private listenToChanges() {
    this.checks.valueChanges.subscribe(values => {
      this.verificarEstadoCompleto();
      const procedimientoId = sessionStorage.getItem('procedimientoActivo');
      if (procedimientoId) {
        const guardados = JSON.parse(localStorage.getItem('estandarizaciones') || '{}');
        guardados[procedimientoId] = guardados[procedimientoId] || {};
        guardados[procedimientoId][this.indice!] = values;
        localStorage.setItem('estandarizaciones', JSON.stringify(guardados));
      }
    });
  }

  private verificarEstadoCompleto() {
    let completo = true;
    if (this.indice !== 0) {
      completo = this.checks.controls.every(c => c.value === true);
    }
    this.estadoCompleto.emit({ index: this.indice!, completo });
  }

  ngOnChanges() {
  if (this.refrescar && typeof this.indice === 'number') {
    const procedimientoId = sessionStorage.getItem('procedimientoActivo');
    const guardados = JSON.parse(localStorage.getItem('estandarizaciones') || '{}');
    const prev = procedimientoId ? guardados?.[procedimientoId]?.[this.indice] || [] : [];

    // Actualizar visualmente los checks
    prev.forEach((val: boolean, i: number) => {
      if (this.checks.at(i)) {
        this.checks.at(i).setValue(val, { emitEvent: false });
      }
    });
  }
}

}
