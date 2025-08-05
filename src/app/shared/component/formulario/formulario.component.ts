import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-formulario',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.css'
})
export class FormularioComponent {
  @Input() indice!: number;
  @Input() titulo: string | undefined; 
  @Input() campos: { key: string; label: string; required?: boolean }[] = [];
  @Output() submitForm = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  

  formulario!: FormGroup;
  

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const grupo: Record<string, any> = {};
    for (const campo of this.campos) {
      grupo[campo.key] = campo.required ? [null, Validators.required] : [null];
    }
    this.formulario = this.fb.group(grupo);
  }

  onSubmit(): void {
    if (this.formulario.valid) {
      this.submitForm.emit(this.formulario.value);
    } else {
      this.formulario.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}


