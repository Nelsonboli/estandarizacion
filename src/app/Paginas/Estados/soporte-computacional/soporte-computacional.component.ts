import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-soporte-computacional',
  imports: [ReactiveFormsModule, CommonModule ],
  templateUrl: './soporte-computacional.component.html',
  styleUrl: './soporte-computacional.component.css'
})
export class SoporteComputacionalComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder){}
 
 ngOnInit() {
    this.form = this.fb.group({
      respuesta1: [''],
      detalle1: [''],
      respuesta2: [''],
      detalle2: [''],
    });

    // Escucha cambios para habilitar o deshabilitar textarea
    this.form.get('respuesta1')?.valueChanges.subscribe(value => {
      if (value === 'si') {
        this.form.get('detalle1')?.enable();
        this.form.get('respuesta2')?.setValue('');
        this.form.get('detalle2')?.disable();
      } else if (value === 'no') {
        this.form.get('detalle1')?.disable();
        this.form.get('detalle1')?.reset();
      }
    });

    this.form.get('respuesta2')?.valueChanges.subscribe(value => {
      if (value === 'si') {
        this.form.get('detalle2')?.enable();
      } else {
        this.form.get('detalle2')?.disable();
        this.form.get('detalle2')?.reset();
      }
    });

    // Inicialmente deshabilitar los textareas
    this.form.get('detalle1')?.disable();
    this.form.get('detalle2')?.disable();
  }

  onSubmit() {
    console.log(this.form.value);
  }


}
