import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-soporte-computacional',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './soporte-computacional.component.html',
  styleUrl: './soporte-computacional.component.css'
})
export class SoporteComputacionalComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      respuesta1: [''],
      detalle1: [{ value: '', disabled: true }, []], // se activan solo si respuesta1 = "si"
      detalle2: [{ value: '', disabled: true }, []],
      respuesta2: [''] // solo aparece si respuesta1 = "no"
    });

    // 🔹 Control de respuesta1
    this.form.get('respuesta1')?.valueChanges.subscribe(value => {
      if (value === 'si') {
        // habilitar los detalles
        this.form.get('detalle1')?.enable();
        this.form.get('detalle2')?.enable();

        // limpiar respuesta2 porque ya no aplica
        this.form.get('respuesta2')?.reset();
      } else if (value === 'no') {
        // deshabilitar los detalles
        this.form.get('detalle1')?.disable();
        this.form.get('detalle1')?.reset();
        this.form.get('detalle2')?.disable();
        this.form.get('detalle2')?.reset();
      }
    });

    // 🔹 Control de respuesta2
    this.form.get('respuesta2')?.valueChanges.subscribe(value => {
      if (value === 'si') {
        // no hay que habilitar campos, solo se muestra texto en HTML
        console.log('Se recomienda crear un soporte computacional');
      } else if (value === 'no') {
        console.log('El procedimiento no necesita soporte computacional');
      }
    });
  }

  onSubmit() {
    console.log(this.form.value);
  }
}
