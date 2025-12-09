import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges } from '@angular/core';
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
  @Input() valoresExternos: boolean[] | null = null;
  form!: FormGroup;
  subopciones: string[] = [];

  opciones = [
    ["Formulario de procedimiento DAAC", "Reglamento base", "Diagrama de procedimiento"],
    ["Soporte computacional"],
    ["Procedimiento Enviado DAAC", "Procedimiento aprobado por la DAAC"]
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    if (typeof this.indice === 'number') {
      this.subopciones = this.opciones[this.indice];
      const procedimientoId = sessionStorage.getItem('procedimientoActivo');
      const guardados = JSON.parse(localStorage.getItem('estandarizaciones') || '{}');

      // Priorizar valoresExternos sobre localStorage
      let valoresIniciales: boolean[];
      if (this.valoresExternos && this.valoresExternos.length > 0) {
        valoresIniciales = this.valoresExternos;
        console.log('🎯 Card inicializado con valoresExternos:', valoresIniciales);
      } else {
        const prev = procedimientoId ? guardados?.[procedimientoId]?.[this.indice] || [] : [];
        valoresIniciales = this.subopciones.map((_, i) => prev[i] || false);
        console.log('💾 Card inicializado con localStorage:', valoresIniciales);
      }

      this.form = this.fb.group({
        checks: this.fb.array(
          this.subopciones.map((_, i) => this.fb.control(valoresIniciales[i] || false))
        )
      });

      // Deshabilitar checkboxes que están marcados
      valoresIniciales.forEach((val, i) => {
        if (val === true && this.checks.at(i)) {
          this.checks.at(i).disable({ emitEvent: false });
        }
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
    if (this.indice !== null) {
      completo = this.checks.controls.every(c => c.value === true);
    }
    this.estadoCompleto.emit({ index: this.indice!, completo });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.form) return;
    if (changes['valoresExternos'] && this.valoresExternos) {
      console.log('🔄 Card recibió valoresExternos:', this.valoresExternos);
      console.log('📍 Índice de card:', this.indice);

      this.valoresExternos.forEach((val, i) => {
        if (this.checks && this.checks.at(i)) {
          const currentValue = this.checks.at(i).value;
          if (currentValue !== val) {
            console.log(`✏️ Actualizando check ${i}: ${currentValue} -> ${val}`);
            this.checks.at(i).setValue(val, { emitEvent: true });
          }

          // Deshabilitar el checkbox si está marcado (no se puede desmarcar manualmente)
          if (val === true) {
            this.checks.at(i).disable({ emitEvent: false });
            console.log(`🔒 Checkbox ${i} deshabilitado (completado)`);
          } else {
            this.checks.at(i).enable({ emitEvent: false });
            console.log(`🔓 Checkbox ${i} habilitado (pendiente)`);
          }
        }
      });
    }
    if (this.refrescar && typeof this.indice === 'number') {
      const procedimientoId = sessionStorage.getItem('procedimientoActivo');
      const guardados = JSON.parse(localStorage.getItem('estandarizaciones') || '{}');
      const prev = procedimientoId ? guardados?.[procedimientoId]?.[this.indice] || [] : [];
      // Actualizar visualmente los checks   
      prev.forEach((val: boolean, i: number) => {
        if (this.checks && this.checks.at(i)) {
          this.checks.at(i).setValue(val, { emitEvent: false });
        }
      });
    }
  }
}
