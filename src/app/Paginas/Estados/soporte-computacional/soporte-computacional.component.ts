import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, output, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SoporteComputacionalService } from '../../../shared/servicios/soporte-computacional.service';
import { AlertService } from '../../../shared/Utils/Alertas/alert.service';

@Component({
  selector: 'app-soporte-computacional',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './soporte-computacional.component.html',
  styleUrl: './soporte-computacional.component.css'
})
export class SoporteComputacionalComponent implements OnInit {
  form!: FormGroup;

   soporteEnviado = output<boolean>();
  
  constructor(
    private fb: FormBuilder,
    private soporteService: SoporteComputacionalService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      respuesta1: ['',Validators.required],
      detalle1: [{ value: '', disabled: true }, Validators.required], // se activan solo si respuesta1 = "si"
      detalle2: [{ value: '', disabled: true }, Validators.required],
      respuesta2: [''] // aparece si respuesta1 = "no"
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
  }

onSubmit() {
  this.FormularioValido()
  }


  FormularioValido(){
    const respuesta1 = this.form.get('respuesta1')?.value;
    const detalle1 = this.form.get('detalle1')?.value;
    const detalle2 = this.form.get('detalle2')?.value;
    const respuesta2 = this.form.get('respuesta2')?.value;

    // Caso 1: Tiene soporte (respuesta1 = "si")
    if (respuesta1 === 'si') {
      if (detalle1 && detalle2) {
        this.soporteService.setSoporteComputacional(this.form.value);
        this.alertService.alertArriba('Soporte computacional enviado');
        this.soporteEnviado.emit(true);
      } else {
        this.alertService.error('Por favor completa todos los campos del soporte.');
      }
    }

    // Caso 2: No tiene soporte (respuesta1 = "no")
    else if (respuesta1 === 'no') {
      if (respuesta2) {
        this.soporteService.setSoporteComputacional(this.form.value);
        this.alertService.alertArriba('Se registro que el procedimiento no tiene soporte computacional.');
        this.soporteEnviado.emit(true);
      } else {
        this.alertService.error('Selecciona si el procedimiento requiere crear soporte o no.');
      }
    } else {
      this.alertService.error('Selecciona una respuesta antes de enviar.');
    }

  }

}
