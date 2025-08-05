import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-card',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent implements OnInit {
  @Input() indice: number | null = null;
  @Output() estadoCompleto = new EventEmitter<{ index: number; completo: boolean }>();

  form!: FormGroup;
  subopciones: string[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    if (typeof this.indice === 'number') {
      this.subopciones = this.opciones[this.indice];
      this.form = this.fb.group({
        checks: this.fb.array(this.subopciones.map(() => this.fb.control(false)))
      });
      this.listenToChanges();
    }
  }

  get checks(): FormArray {
    return this.form.get('checks') as FormArray;
  }

  opciones = [
    ["Actividades del procedimiento", "Roles del procedimiento", "referencias"],
    ["Formato de procedimiento DAAC", "Reglamento base", "Procedimiento", "Acta de socializacion de procedimiento"],
    ["Soporte computacional"],
    ["procedimiento Enviado DAAC", "Procedimiento aprobado por la DAAC"]
  ];

  listenToChanges() {
    this.checks.valueChanges.subscribe(() => {
      const completo = this.checks.controls.every(c => c.value === true);
      this.estadoCompleto.emit({ index: this.indice!, completo });
    });
  }
}
